import { Router } from 'express';
import { chatCompletion } from '../services/ai.js';

const router = Router();

router.post('/completion', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await chatCompletion(messages);
    res.json({ response, source: 'Badan_Intelijen_Negara_Core' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Core malfunction', 
      details: error instanceof Error ? error.message : 'Unknown' 
    });
  }
});

router.post('/tool-enhanced', async (req, res) => {
  const { messages, activeTools } = req.body;
  
  const toolContext = activeTools?.map((t: string) => `[ACTIVE_TOOL: ${t}]`).join('\n') || '';
  
  const enhancedMessages = [
    ...messages,
    {
      role: 'system',
      content: `Active tools: ${toolContext}. You can reference these capabilities in your responses.`
    }
  ];

  try {
    const response = await chatCompletion(enhancedMessages);
    res.json({ response, tools_used: activeTools || [] });
  } catch (error) {
    res.status(500).json({ error: 'Enhanced core failed', details: error });
  }
});

export default router;
