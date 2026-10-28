import { IChatService } from '../contracts';
import { ChatMessage, RiskLevel, SuggestedAction } from '../../types/companion';

export class MockChatService implements IChatService {
  private static responses: Record<string, { text: string; action?: SuggestedAction; risk?: RiskLevel }> = {
    breath: {
      text: "Let's pause together for a moment. Feel your feet resting on the ground, and inhale gently for four seconds. I'm right here with you.",
      action: 'breathing',
      risk: 'none',
    },
    overwhelm: {
      text: "It sounds like there is a lot pulling at your attention all at once. When everything feels loud, what is one single thing we can set aside for the next thirty minutes?",
      action: 'journal',
      risk: 'elevated',
    },
    tired: {
      text: "Your body has been carrying you through a demanding session. How would a gentle five-minute posture release in our Yoga Studio feel right now?",
      action: 'breathing',
      risk: 'none',
    },
    default: {
      text: "I hear you clearly. When we notice that sensation arising during work, taking a conscious breath often helps restore our natural center. How does your chest and shoulders feel right now?",
      action: null,
      risk: 'none',
    },
    crisis: {
      text: "I want you to know that you are not alone in this moment, and your safety matters deeply to me. Please reach out to someone who can help support you right now. You can open the support directory or contact someone you trust.",
      action: 'talk_to_someone',
      risk: 'acute',
    },
  };

  async sendMessage(
    message: string,
    history: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (fullMessage: ChatMessage) => void
  ): Promise<void> {
    const lower = message.toLowerCase();
    let template = MockChatService.responses.default;

    if (lower.includes('die') || lower.includes('kill') || lower.includes('hurt myself') || lower.includes('suicide') || lower.includes('end it')) {
      template = MockChatService.responses.crisis;
    } else if (lower.includes('breath') || lower.includes('calm') || lower.includes('panic') || lower.includes('anxious')) {
      template = MockChatService.responses.breath;
    } else if (lower.includes('overwhelm') || lower.includes('stress') || lower.includes('burnout')) {
      template = MockChatService.responses.overwhelm;
    } else if (lower.includes('tired') || lower.includes('posture') || lower.includes('body') || lower.includes('neck')) {
      template = MockChatService.responses.tired;
    }

    // Simulate streaming chunks
    if (template === MockChatService.responses.default) {
 const alternatives = ['What would make today feel a little more manageable?', 'Would you like to reflect on that, or choose one small next step?', 'What feels most important about this moment to you?'];
 template = {text: alternatives[history.filter(m => m.sender === 'user').length % alternatives.length]};
 if (/focus|deadline|work|scattered/.test(lower)) template = {text:'Let us make a small plan: choose one task, clear a little space, and decide when to pause. What would you like to begin with?',action:'journal'};
 else if (/happy|great|proud|finished/.test(lower)) template = {text:'That sounds like something to appreciate. What helped you get there?',action:'journal'};
 else if (/sad|lonely|upset|cry/.test(lower)) template = {text:'That sounds difficult. You can take your time here. Would writing about it or reaching out to someone you trust feel helpful?',risk:'elevated',action:'journal'};
 else if (/health|heart|telemetry|clinical|score/.test(lower)) template = {text:'The health readings here are simulated demo data. I cannot assess your health from them. You can explore the Health page to see how the interface works.'};
 else if (/stretch|yoga|tension/.test(lower)) template = MockChatService.responses.tired;
}
await new Promise(r => setTimeout(r, 500));
const words = ('Demo response ? ' + template.text).split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 45 + Math.random() * 30));
      const word = (i === 0 ? '' : ' ') + words[i];
      currentText += word;
      onChunk(currentText);
    }

    const completed: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'companion',
      content: currentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskLevel: template.risk,
      suggestedAction: template.action,
    };

    onComplete(completed);
  }

  getStarters(worldId: string): string[] {
    switch (worldId) {
      case 'forest':
        return [
          'Can we do a short 2-minute settling breath?',
          "I'm feeling a bit scattered with today's deadlines.",
          'Suggest a gentle morning stretch.',
        ];
      case 'space':
        return [
          'What is my focus telemetry looking like today?',
          'Help me structure a 45-minute deep work block.',
          'Show me a grounding breath cadence.',
        ];
      case 'zen':
        return [
          'Guide me through a quiet reflection on today.',
          'My shoulders feel tight after typing all afternoon.',
          'Start a 10-minute mindful timer.',
        ];
      case 'medical':
        return [
          'How is my heart-rate variability trending?',
          'Check my posture alignment score.',
          'I need clinical clarity on my fatigue levels.',
        ];
      default:
        return [
          'Help me find a mindful rhythm for today.',
          'How can I release screen tension?',
          'Record a reflective thought for my journal.',
        ];
    }
  }
}
