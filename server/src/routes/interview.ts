import { Router, Request, Response } from 'express';
import { processInterview } from '../services/claude';
import { selectPortfolio } from '../services/portfolio';
import {
  InterviewRequest,
  InterviewResponse,
  AnswerSummary,
} from '../types';

const router = Router();

router.post('/next', async (req: Request, res: Response) => {
  try {
    const body = req.body as InterviewRequest;

    if (!body.sessionId || !body.currentQuestionId || body.lastUserUtterance === undefined) {
      res.status(400).json({
        error: 'Missing required fields: sessionId, currentQuestionId, lastUserUtterance',
      });
      return;
    }

    const claudeResult = await processInterview(body);

    if (claudeResult.type === 'complete') {
      // Run deterministic portfolio selection
      const summary = claudeResult.updatedAnswers as AnswerSummary;
      const { portfolioId, rationale, portfolio } = selectPortfolio(summary);

      const speakText = portfolioId === 'P1'
        ? `Based on your profile, I've selected the Moderate Growth Portfolio for you. ${rationale}`
        : `Based on your profile, I've selected the Conservative Income Portfolio for you. ${rationale}`;

      const finalResponse: InterviewResponse = {
        type: 'final_result',
        summary,
        selectedPortfolioId: portfolioId,
        rationale,
        portfolio,
        speakText,
      };

      res.json(finalResponse);
      return;
    }

    // next_question or clarification — pass through
    const response: InterviewResponse = claudeResult as InterviewResponse;
    res.json(response);
  } catch (error) {
    console.error('Interview API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
