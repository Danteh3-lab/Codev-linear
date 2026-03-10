document.addEventListener('DOMContentLoaded', () => {
    const DropdownCtor = window.Dropdown;
    const initLaserFlowBridge = window.initLaserFlowBridge;
    const PromptCtor = window.Prompt;
    const body = document.body;

    const initMobileNav = () => {
        const toggle = document.getElementById('mobile-nav-toggle');
        const panel = document.getElementById('mobile-nav-panel');
        const backdrop = document.getElementById('mobile-nav-backdrop');
        const links = panel ? panel.querySelectorAll('[data-mobile-nav-link]') : [];

        if (!toggle || !panel || !backdrop || !body) {
            return;
        }

        let closeTimer = null;

        const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

        const finishClose = () => {
            panel.hidden = true;
            backdrop.hidden = true;
        };

        const closeNav = () => {
            if (!isOpen()) {
                return;
            }

            toggle.setAttribute('aria-expanded', 'false');
            panel.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            body.classList.remove('mobile-nav-open');

            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(finishClose, 180);
        };

        const openNav = () => {
            if (isOpen()) {
                return;
            }

            window.clearTimeout(closeTimer);
            panel.hidden = false;
            backdrop.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('mobile-nav-open');

            window.requestAnimationFrame(() => {
                panel.classList.add('is-open');
                backdrop.classList.add('is-open');
            });
        };

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isOpen()) {
                closeNav();
                return;
            }

            openNav();
        });

        backdrop.addEventListener('click', closeNav);

        links.forEach((link) => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNav();
            }
        });

        document.addEventListener('click', (event) => {
            if (!isOpen()) {
                return;
            }

            const target = event.target;
            if (panel.contains(target) || toggle.contains(target)) {
                return;
            }

            closeNav();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                closeNav();
            }
        });
    };

    initMobileNav();

    if (typeof initLaserFlowBridge === 'function') {
        initLaserFlowBridge();
    }

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
