import { Router, Request, Response } from 'express';
import { geminiAgent } from '../agents/geminiAgent.js';
import { nanoid } from 'nanoid';

const router = Router();

// Store active SSE connections
const sseConnections = new Map<string, Response>();

/**
 * POST /api/chat
 * Start a chat session and get SSE stream
 */
router.post('/chat', (req: Request, res: Response) => {
  const { message, userId } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const id = userId || nanoid();
  const surfaceId = `surface-${nanoid()}`;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Store connection
  sseConnections.set(id, res);

  // Process message and stream response
  (async () => {
    try {
      const response = await geminiAgent.processMessage(id, message, surfaceId);

      // Stream A2UI messages
      for (const msg of response.a2uiMessages) {
        res.write(`data: ${JSON.stringify({ type: 'a2ui', content: msg })}\n\n`);
      }

      // Send text response if no A2UI messages
      if (response.a2uiMessages.length === 0) {
        res.write(`data: ${JSON.stringify({ type: 'text', content: response.text })}\n\n`);
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete', userId: id, surfaceId })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Chat error:', error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          content: error instanceof Error ? error.message : 'An error occurred',
        })}\n\n`
      );
      res.end();
    } finally {
      sseConnections.delete(id);
    }
  })();
});

/**
 * POST /api/action
 * Handle user actions from A2UI components
 */
router.post('/action', (req: Request, res: Response) => {
  const { userId, action, data, surfaceId } = req.body;

  if (!userId || !action) {
    res.status(400).json({ error: 'userId and action are required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Process action and stream response
  (async () => {
    try {
      const response = await geminiAgent.handleUserAction(userId, action, data || {}, surfaceId);

      // Stream A2UI messages
      for (const msg of response.a2uiMessages) {
        res.write(`data: ${JSON.stringify({ type: 'a2ui', content: msg })}\n\n`);
      }

      // Send text response if no A2UI messages
      if (response.a2uiMessages.length === 0) {
        res.write(`data: ${JSON.stringify({ type: 'text', content: response.text })}\n\n`);
      }

      // Send completion signal
      res.write(`data: ${JSON.stringify({ type: 'complete', userId })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Action error:', error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          content: error instanceof Error ? error.message : 'An error occurred',
        })}\n\n`
      );
      res.end();
    }
  })();
});

/**
 * POST /api/clear-session
 * Clear conversation context
 */
router.post('/clear-session', (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  geminiAgent.clearContext(userId);
  res.json({ success: true, message: 'Session cleared' });
});

export default router;
