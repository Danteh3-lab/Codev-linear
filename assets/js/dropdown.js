export class Dropdown {
    constructor(selector, onChange) {
        this.dropdown = document.querySelector(selector);
        if (!this.dropdown) {
            return;
        }

        this.toggleButton = this.dropdown.querySelector('.dropdown-toggle');
        this.menu = this.dropdown.querySelector('.dropdown-menu');
        this.onChange = onChange;
        this.input = this.dropdown.querySelector('.dropdown-input');

        if (!this.toggleButton || !this.menu) {
            return;
        }

        this.toggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            this.menu.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!this.dropdown.contains(event.target)) {
                this.menu.classList.remove('show');
            }
        });

        this.dropdown.querySelectorAll('li').forEach((item) => {
            item.addEventListener('click', () => {
                const textNode = item.querySelector('.dropdown-text');
                const menuIcon = item.querySelector('.dropdown-menu-icon iconify-icon');
                const selectedText = textNode ? textNode.innerText : '';

                if (!selectedText) {
                    return;
                }

                const label = this.toggleButton.querySelector('.dropdown-select-text');
                if (label) {
                    label.innerText = selectedText;
                }

                const toggleIcon = this.toggleButton.querySelector('.dropdown-select-icon iconify-icon');
                if (toggleIcon && menuIcon) {
                    const iconSrc = menuIcon.getAttribute('icon');
                    const iconColorClass = menuIcon.getAttribute('class');

                    if (iconSrc) {
                        toggleIcon.setAttribute('icon', iconSrc);
                    }

                    toggleIcon.className = '';
                    if (iconColorClass) {
                        toggleIcon.classList.add(...iconColorClass.split(' '));
                    }
                }

                if (this.input) {
                    this.input.value = selectedText;
                }

                if (this.onChange) {
                    this.onChange(selectedText);
                }

                this.menu.classList.remove('show');
            });
        });
    }
}

