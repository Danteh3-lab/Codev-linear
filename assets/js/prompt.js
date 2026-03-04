export class Prompt {
    constructor(target) {
        this.playground = document.querySelector(target);
        this.promptWindow = this.playground ? this.playground.querySelector('.prompt-container') : null;
        this.promptList = [];
        this.chatModel = 'website build';
    }

    setAIModel(model) {
        if (!model) {
            return;
        }

        this.chatModel = model.toLowerCase();
    }

    addPrompt(message) {
        if (!this.promptWindow || !message || !message.trim()) {
            return;
        }

        if (this.promptList.length === 0) {
            this.promptWindow.replaceChildren();
            this.promptWindow.classList.remove('items-center', 'justify-center');
            this.promptWindow.classList.add('p-4', 'gap-4');
        }

        this.promptList.push(message);

        const userContainer = document.createElement('div');
        userContainer.className = 'w-full flex mb-2';

        const userBubble = document.createElement('div');
        userBubble.className = 'chat-user-bubble animate-[fadeIn_0.3s_ease-out]';
        userBubble.textContent = message;

        userContainer.appendChild(userBubble);
        this.promptWindow.appendChild(userContainer);
        this.promptWindow.scrollTop = this.promptWindow.scrollHeight;

        setTimeout(() => this.answer(), 600);
    }

    answer() {
        if (!this.promptWindow) {
            return;
        }

        const responses = {
            'website build': 'Great fit. We will scope your website, define milestones, and deliver with quality checks from kickoff to launch.',
            'web app': 'We will map workflows, architecture, and release phases for your custom web app, with support included after launch.',
            'mobile app': 'We will define core mobile features, delivery milestones, and launch readiness, then support iteration post-launch.',
            'internal business tool': 'We will design and build an internal business tool aligned to your team workflow, with support included by default.'
        };

        const message = responses[this.chatModel] || responses['website build'];

        const replyContainer = document.createElement('div');
        replyContainer.className = 'w-full flex mb-2';

        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-team-bubble animate-[fadeIn_0.3s_ease-out]';
        replyBubble.textContent = message;

        replyContainer.appendChild(replyBubble);
        this.promptWindow.appendChild(replyContainer);
        this.promptWindow.scrollTop = this.promptWindow.scrollHeight;
    }
}

