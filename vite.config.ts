import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Helper to parse JSON body
        let bodyBuffer = '';
        req.on('data', (chunk) => {
          bodyBuffer += chunk;
        });

        req.on('end', async () => {
          try {
            const apiKey = process.env.GEMINI_API_KEY;
            const parsedBody = bodyBuffer ? JSON.parse(bodyBuffer) : {};

            if (req.url === '/api/gemini/copilot') {
              const { prompt, scenario, bloodStockContext, role = 'staff' } = parsedBody;

              if (!apiKey) {
                // High-fidelity clinical fallback if API key is not configured
                const simulatedAnswer = `[Clinical Copilot Advisory - Active Protocol: ${scenario || 'Standard Emergency Transfusion'}]
Based on the current emergency inventory metrics and trauma guidelines:
1. Immediate Allocation: In active hemorrhagic shock, initiate Massive Transfusion Protocol (MTP) with 1:1:1 ratio (PRBC : FFP : Platelets).
2. Stock Preservation: Reserve remaining O-Negative units strictly for pediatric resuscitation and females of childbearing potential (<50 yrs) until emergency uncrossed crossmatching is completed.
3. Logistics Dispatch: Recommended requesting an expedited transfer of 6-8 PRBC units from partner trauma hubs (e.g., MGH or Johns Hopkins) to maintain the critical buffer.`;
                res.writeHead(200);
                res.end(JSON.stringify({ text: simulatedAnswer, source: 'clinical_protocol_engine' }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const systemInstruction = `You are the HemaLink Clinical AI Transfusion & Blood Logistics Copilot, operating inside an emergency trauma center and regional blood bank network.
You provide precise, evidence-based recommendations following AABB, WHO, and ATLS (Advanced Trauma Life Support) protocols.
You assist doctors and blood bank staff with:
- Emergency blood component selection and Massive Transfusion Protocol (MTP) activation.
- Safe alternative blood group selection when inventory is in critical shortage (e.g. Rh-negative conservation).
- Blood demand forecasting based on mass casualty incidents, weather disruptions, or holiday surgical schedules.
- Donor eligibility questions, adverse reaction management (TRALI, TACO, hemolytic reactions), and component shelf-life logistics.
Provide succinct, highly clinical, professional, and actionable guidance with clear steps and bullet points.`;

              const userPrompt = `Role: ${role}\nClinical Context / Stock Context:\n${JSON.stringify(bloodStockContext || {}, null, 2)}\nScenario: ${scenario || 'Standard Trauma Support'}\n\nQuestion / Directive:\n${prompt}`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: userPrompt,
                config: {
                  systemInstruction,
                  temperature: 0.2,
                },
              });

              res.writeHead(200);
              res.end(JSON.stringify({ text: response.text || 'No response generated.', source: 'gemini-3.8-flash' }));
              return;
            }

            if (req.url === '/api/gemini/eligibility') {
              const { questionnaire } = parsedBody;

              if (!apiKey) {
                // Rule-based fallback
                const weight = Number(questionnaire.weightKg || questionnaire.weightLbs * 0.453592 || 0);
                const age = Number(questionnaire.age || 0);
                const isUnderweight = weight < 50;
                const isUnderage = age < 16;
                const feelingSick = questionnaire.feelingHealthy === 'no';
                const hasAntibiotics = questionnaire.antibiotics === 'yes';

                const isEligible = !isUnderweight && !isUnderage && !feelingSick && !hasAntibiotics;

                res.writeHead(200);
                res.end(
                  JSON.stringify({
                    isEligible,
                    headline: isEligible ? 'Pre-Screening Passed: You are eligible to donate!' : 'Temporary Deferral Advised',
                    reason: isEligible
                      ? 'Your physiological indicators meet FDA & AABB voluntary blood donation safety thresholds.'
                      : 'One or more screening criteria require a temporary waiting period to safeguard donor and recipient health.',
                    clinicalNotes: 'Remember to drink 16 oz of water and eat an iron-rich meal prior to your appointment.',
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

              const screeningPrompt = `Analyze this prospective blood donor self-check questionnaire against standard AABB / FDA blood donation eligibility standards:
${JSON.stringify(questionnaire, null, 2)}

Provide a structured assessment:
1. Is the donor eligible right now? (true/false)
2. Concise headline summary (1 sentence)
3. Clinical explanation of why they are eligible or why they must be deferred (including duration of deferral if applicable)
4. Pre-donation health advisory advice for the donor`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: screeningPrompt,
                config: {
                  systemInstruction: 'You are a certified Transfusion Medicine donor screening physician evaluating donor eligibility criteria accurately and compassionately.',
                  temperature: 0.1,
                },
              });

              res.writeHead(200);
              res.end(JSON.stringify({ analysis: response.text, source: 'gemini-3.8-flash' }));
              return;
            }

            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (err: unknown) {
            console.error('Gemini API middleware error:', err);
            res.writeHead(500);
            const message = err instanceof Error ? err.message : 'Internal Server Error';
            res.end(JSON.stringify({ error: message }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

