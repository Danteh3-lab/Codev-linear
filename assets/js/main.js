import { Dropdown } from './dropdown.js';
import { Prompt } from './prompt.js';

document.addEventListener('DOMContentLoaded', () => {
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
                'Need a high-quality business website?',
                'Need a custom web app for your users?',
                'Planning a mobile app for your customers?',
                'Need an internal business tool for your team?'
            ],
            typeSpeed: 40,
            backSpeed: 20,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    const promptSystem = new Prompt('#project-starter-playground');
    new Dropdown('#service-dropdown', (value) => promptSystem.setAIModel(value));

    const form = document.getElementById('prompt-form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const input = form.querySelector('input[name="prompt"]');
        if (!input) {
            return;
        }

        promptSystem.addPrompt(input.value);
        input.value = '';
    });
});

