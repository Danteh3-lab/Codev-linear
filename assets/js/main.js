document.addEventListener('DOMContentLoaded', () => {
    const initLaserFlowBridge = window.initLaserFlowBridge;
    const PromptCtor = window.Prompt;
    const TypedCtor = window.Typed;
    const body = document.body;
    const serviceLabel = document.getElementById('mobile-service-label');
    const phaseLabel = document.getElementById('mobile-phase-label');
    const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = prefersReducedMotionQuery.matches;
    const serviceIcons = {
        'website build': 'solar:laptop-minimalistic-linear',
        'web app': 'solar:smartphone-linear',
        'mobile app': 'solar:cloud-linear',
        'internal business tool': 'solar:shield-check-linear'
    };

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

    const syncMobileSheet = (value) => {
        if (!value) {
            return;
        }

        const normalized = value.toLowerCase();
        if (serviceLabel) {
            serviceLabel.textContent = value;
        }

        const serviceIcon = document.querySelector('.mobile-chat-sheet__icon iconify-icon');
        if (serviceIcon && serviceIcons[normalized]) {
            serviceIcon.setAttribute('icon', serviceIcons[normalized]);
        }

        if (phaseLabel) {
            phaseLabel.textContent = normalized === 'internal business tool' ? 'Ops Workflow Ready' : 'Discovery Ready';
        }
    };

    initMobileNav();

    document.querySelectorAll('a[data-coming-soon="true"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
        });
    });

    if (typeof initLaserFlowBridge === 'function') {
        initLaserFlowBridge();
    }

    const typedTarget = document.getElementById('prompts-sample');
    if (typedTarget) {
        if (prefersReducedMotion) {
            typedTarget.textContent = 'Need a business website that feels solid?';
        } else if (typeof TypedCtor === 'function') {
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
    }

    const playground = document.getElementById('project-starter-playground');
    const form = document.getElementById('prompt-form');
    const input = form ? form.querySelector('input[name="prompt"]') : null;
    const serviceSelect = document.getElementById('service-select');
    const promptSystem = (playground && typeof PromptCtor === 'function')
        ? new PromptCtor('#project-starter-playground', { autoplay: !prefersReducedMotion })
        : null;

    if (playground) {
        playground.addEventListener('prompt:model-change', (event) => {
            const model = event.detail && event.detail.model ? event.detail.model : '';
            if (!model) {
                return;
            }

            syncMobileSheet(model.replace(/\b\w/g, (character) => character.toUpperCase()));
        });
    }

    if (serviceSelect) {
        syncMobileSheet(serviceSelect.value);

        serviceSelect.addEventListener('change', (event) => {
            const value = event.target.value;

            if (promptSystem) {
                promptSystem.stopAutoplay();
                promptSystem.setAIModel(value);
            }

            syncMobileSheet(value);
        });
    }

    if (!form || !input || !promptSystem) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        promptSystem.addPrompt(input.value);
        input.value = '';
    });
});
