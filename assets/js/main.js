document.addEventListener('DOMContentLoaded', () => {
    const DropdownCtor = window.Dropdown;
    const PromptCtor = window.Prompt;
    if (typeof DropdownCtor !== 'function' || typeof PromptCtor !== 'function') {
        return;
    }

    document.querySelectorAll('a[data-coming-soon="true"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
        });
    });

    const typedTarget = document.getElementById('prompts-sample');
    const TypedCtor = window.Typed;

    if (typedTarget && typeof TypedCtor === 'function') {
        new TypedCtor('#prompts-sample', {
            strings: [
                'Need a business website that feels solid?',
                'Need a web app built around how your users actually work?',
                'Thinking about a mobile app for your customers?',
                'Need an internal tool that saves your team time?'
            ],
            typeSpeed: 40,
            backSpeed: 20,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    const promptSystem = new PromptCtor('#project-starter-playground', { autoplay: true });
    new DropdownCtor('#service-dropdown', (value) => {
        promptSystem.stopAutoplay();
        promptSystem.setAIModel(value);
    });

    const form = document.getElementById('prompt-form');
    if (!form) {
        return;
    }

    const input = form.querySelector('input[name="prompt"]');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!input) {
            return;
        }

        promptSystem.addPrompt(input.value);
        input.value = '';
    });
});
