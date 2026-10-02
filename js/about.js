(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const touchMode = window.matchMedia('(hover: none)').matches;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const XLINK_NS = 'http://www.w3.org/1999/xlink';
    const BUTTON_SELECTOR = '.main-button, [data-fx-button]';

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    const create = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    };

    const splitWords = (heading) => {
        const nodes = [...heading.childNodes];
        let index = 0;
        heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
        heading.textContent = '';
        heading.dataset.split = '';

        nodes.forEach((node) => {
            const isElement = node.nodeType === 1;
            const holder = isElement ? node.cloneNode(false) : heading;
            const words = node.textContent.trim().split(/\s+/).filter(Boolean);

            words.forEach((word) => {
                const mask = create('span', 'word');
                const inner = create('span', 'word-inner', word);
                inner.style.setProperty('--i', index++);
                mask.setAttribute('aria-hidden', 'true');
                mask.append(inner);
                holder.append(mask, document.createTextNode(' '));
            });

            if (isElement) heading.append(holder);
        });
    };

    const setupReveal = () => {
        const heroSequence = [
            ['.hero .eyebrow', 100],
            ['.hero-text', 800],
            ['.hero .main-button', 950],
            ['.hero-side', 1050]
        ];

        heroSequence.forEach(([selector, delay]) => {
            const element = $(selector);
            if (!element) return;
            element.dataset.reveal = '';
            element.style.setProperty('--d', `${delay}ms`);
        });

        [
            '.section-number',
            '.about-text p',
            '.section-top > p',
            '.service',
            '.statement .eyebrow',
            '.member',
            '.cta .eyebrow',
            '.cta .main-button'
        ].forEach((selector) => {
            $$(selector).forEach((element) => {
                element.dataset.reveal = '';
            });
        });

        $$('.hero h1, .about h2, .section-top h2, .statement h2, .cta h2').forEach(splitWords);

        const observer = new IntersectionObserver((entries) => {
            let order = 0;
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                const hasDelay = element.style.getPropertyValue('--d') !== '';
                if (!hasDelay && !('split' in element.dataset)) {
                    element.style.setProperty('--d', `${order * 90}ms`);
                }
                order++;
                element.classList.add('is-visible');
                observer.unobserve(element);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

        return () => {
            $$('[data-reveal], [data-split]').forEach((element) => observer.observe(element));
        };
    };

    const setupSmoothScroll = () => {
        let current = window.scrollY;
        let target = current;
        let running = false;

        const limit = () => root.scrollHeight - window.innerHeight;

        const tick = () => {
            const diff = target - current;
            if (Math.abs(diff) < 0.4) {
                current = target;
                window.scrollTo(0, current);
                running = false;
                root.style.scrollBehavior = '';
                return;
            }
            current += diff * 0.085;
            window.scrollTo(0, current);
            requestAnimationFrame(tick);
        };

        const start = () => {
            if (running) return;
            running = true;
            root.style.scrollBehavior = 'auto';
            requestAnimationFrame(tick);
        };

        window.addEventListener('wheel', (event) => {
            if (event.ctrlKey) return;
            event.preventDefault();
            const unit = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? window.innerHeight : 1;
            if (!running) {
                current = window.scrollY;
                target = current;
            }
            target = clamp(target + event.deltaY * unit, 0, limit());
            start();
        }, { passive: false });

        window.addEventListener('scroll', () => {
            if (!running) {
                current = window.scrollY;
                target = current;
            }
        }, { passive: true });

        return (y) => {
            target = clamp(y, 0, limit());
            start();
        };
    };

    const setupAnchors = (scrollToY) => {
        $$('a[href^="#"]').forEach((link) => {
            const id = link.getAttribute('href');
            if (id.length < 2) return;
            const section = $(id);
            if (!section) return;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                scrollToY(section.getBoundingClientRect().top + window.scrollY);
            });
        });
    };

    const setupDimensions = () => {
        $$('.about h2, .section-top h2, .cta h2').forEach((heading, index) => {
            const line = create('div', 'dim');
            line.dataset.reveal = '';
            line.setAttribute('aria-hidden', 'true');
            line.append(create('span', '', `${(2.4 + index * 1.2).toFixed(2)} m`));
            heading.after(line);
        });
    };

    const setupHero = () => {
        const hero = $('.hero');
        if (!hero) return;

        const glow = create('div', 'hero-glow');
        hero.prepend(glow);

        const rect = hero.getBoundingClientRect();
        const state = { x: rect.width * 0.7, y: rect.height * 0.45, tx: rect.width * 0.7, ty: rect.height * 0.45, raf: 0 };

        const render = () => {
            state.x += (state.tx - state.x) * 0.08;
            state.y += (state.ty - state.y) * 0.08;
            glow.style.transform = `translate3d(${state.x - 360}px, ${state.y - 360}px, 0)`;
            if (Math.abs(state.tx - state.x) > 0.5 || Math.abs(state.ty - state.y) > 0.5) {
                state.raf = requestAnimationFrame(render);
            } else {
                state.raf = 0;
            }
        };

        const kick = () => {
            if (!state.raf) state.raf = requestAnimationFrame(render);
        };

        hero.addEventListener('pointermove', (event) => {
            const bounds = hero.getBoundingClientRect();
            state.tx = event.clientX - bounds.left;
            state.ty = event.clientY - bounds.top;
            hero.style.setProperty('--mx', `${state.tx}px`);
            hero.style.setProperty('--my', `${state.ty}px`);
            kick();
        });

        render();
        requestAnimationFrame(() => glow.classList.add('is-active'));
    };

    const setupScrollEffects = () => {
        const hero = $('.hero');
        const content = $('.hero-content');
        const side = $('.hero-side');
        const statement = $('.statement');
        const bar = create('div', 'progress');
        let frame = 0;

        document.body.prepend(bar);

        const update = () => {
            frame = 0;
            const y = window.scrollY;
            const max = Math.max(root.scrollHeight - window.innerHeight, 1);
            bar.style.transform = `scaleX(${clamp(y / max, 0, 1)})`;

            if (statement) {
                const box = statement.getBoundingClientRect();
                const view = window.innerHeight;
                statement.style.setProperty('--lit', clamp((view - box.top) / (view * 0.9), 0, 1).toFixed(3));
            }

            if (!hero || !content || !side) return;
            const height = hero.offsetHeight;
            if (y < height * 1.2) {
                content.style.translate = `0 ${y * 0.18}px`;
                content.style.opacity = clamp(1 - y / (height * 0.8), 0, 1);
                side.style.translate = `0 ${y * 0.08}px`;
            }
        };

        window.addEventListener('scroll', () => {
            if (!frame) frame = requestAnimationFrame(update);
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    };

    const scramble = (node, text, speed = 1) => {
        cancelAnimationFrame(node.scrambleFrame);
        if (reduceMotion) {
            node.textContent = text;
            return;
        }

        const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&+';
        const duration = 800 / speed;
        const start = performance.now();

        const step = (now) => {
            const progress = clamp((now - start) / duration, 0, 1);
            let output = '';

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const settleAt = (i / text.length) * 0.8 + 0.2;
                if (char === ' ' || progress >= settleAt) {
                    output += char;
                } else {
                    output += glyphs[Math.floor(Math.random() * glyphs.length)];
                }
            }

            node.textContent = output;
            if (progress < 1) node.scrambleFrame = requestAnimationFrame(step);
        };

        node.scrambleFrame = requestAnimationFrame(step);
    };

    const buildRing = (role, id) => {
        const wrap = create('div', 'member-ring');
        const svg = document.createElementNS(SVG_NS, 'svg');
        const path = document.createElementNS(SVG_NS, 'path');
        const line = document.createElementNS(SVG_NS, 'circle');
        const text = document.createElementNS(SVG_NS, 'text');
        const textPath = document.createElementNS(SVG_NS, 'textPath');

        const label = role.toUpperCase();
        const unit = `${label} • `;
        const repeats = Math.max(2, Math.round(60 / unit.length));

        svg.setAttribute('viewBox', '0 0 200 200');
        svg.setAttribute('class', 'ring-svg');
        svg.setAttribute('aria-hidden', 'true');

        path.setAttribute('id', `ring-path-${id}`);
        path.setAttribute('d', 'M 10,100 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0');
        path.setAttribute('fill', 'none');

        line.setAttribute('cx', '100');
        line.setAttribute('cy', '100');
        line.setAttribute('r', '83');
        line.setAttribute('pathLength', '1');
        line.setAttribute('class', 'ring-line');

        text.setAttribute('class', 'ring-text');
        text.setAttribute('textLength', '565');
        text.setAttribute('lengthAdjust', 'spacing');

        textPath.setAttribute('href', `#ring-path-${id}`);
        textPath.setAttributeNS(XLINK_NS, 'xlink:href', `#ring-path-${id}`);
        textPath.textContent = unit.repeat(repeats);

        text.append(textPath);
        svg.append(path, line, text);
        wrap.append(svg);
        return wrap;
    };

    const setupMotion = (box, chips) => {
        const image = $('img', box);
        const s = { x: 0, y: 0, tx: 0, ty: 0, gx: 130, gy: 130, tgx: 130, tgy: 130, raf: 0 };

        const render = () => {
            s.x += (s.tx - s.x) * 0.1;
            s.y += (s.ty - s.y) * 0.1;
            s.gx += (s.tgx - s.gx) * 0.22;
            s.gy += (s.tgy - s.gy) * 0.22;

            box.style.transform = `perspective(900px) rotateX(${-s.y * 9}deg) rotateY(${s.x * 9}deg)`;
            box.style.setProperty('--gx', `${s.gx}px`);
            box.style.setProperty('--gy', `${s.gy}px`);

            if (image) {
                image.style.transform = `translate3d(${-s.x * 12}px, ${-s.y * 12}px, 0) scale(1.1)`;
            }

            chips.forEach(({ inner, depth }) => {
                inner.style.translate = `${s.x * depth}px ${s.y * depth}px`;
            });

            const moving =
                Math.abs(s.tx - s.x) > 0.001 ||
                Math.abs(s.ty - s.y) > 0.001 ||
                Math.abs(s.tgx - s.gx) > 0.3 ||
                Math.abs(s.tgy - s.gy) > 0.3;

            s.raf = moving ? requestAnimationFrame(render) : 0;
        };

        const kick = () => {
            if (!s.raf) s.raf = requestAnimationFrame(render);
        };

        box.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse') return;
            const rect = box.getBoundingClientRect();
            s.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            s.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            s.tgx = event.clientX - rect.left;
            s.tgy = event.clientY - rect.top;
            kick();
        });

        box.addEventListener('pointerleave', () => {
            s.tx = 0;
            s.ty = 0;
            s.tgx = box.offsetWidth / 2;
            s.tgy = box.offsetHeight / 2;
            kick();
        });
    };

    const setupMembers = () => {
        const members = $$('.member');
        let uid = 0;

        members.forEach((member) => {
            const box = $('.member-image', member);
            const roleNode = $('.member-info p', member);
            if (!box || !roleNode) return;

            const role = roleNode.textContent.trim();
            const bio = member.dataset.bio || role;
            const skills = (member.dataset.skills || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 3);

            const stage = create('div', 'member-stage');
            box.replaceWith(stage);
            stage.append(buildRing(role, uid++), box);
            box.append(create('span', 'member-lens'), create('span', 'member-glare'));

            const angles = [-34, 24, 156];
            const chips = skills.map((label, index) => {
                const chip = create('span', 'member-chip');
                const inner = create('span', 'chip-inner', label);
                chip.style.setProperty('--n', index);
                chip.append(inner);
                stage.append(chip);
                return { chip, inner, depth: 14 + index * 9, angle: (angles[index] * Math.PI) / 180 };
            });

            const placeChips = () => {
                const radius = (90 * (stage.offsetWidth + 68)) / 200 + 6;
                chips.forEach(({ chip, angle }) => {
                    chip.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
                    chip.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
                });
            };

            const open = () => {
                if (member.classList.contains('is-open')) return;
                placeChips();
                member.classList.add('is-open');
                scramble(roleNode, bio);
            };

            const close = () => {
                if (!member.classList.contains('is-open')) return;
                member.classList.remove('is-open');
                scramble(roleNode, role, 1.6);
            };

            member.closeCard = close;
            box.tabIndex = 0;

            box.addEventListener('pointerenter', (event) => {
                if (event.pointerType === 'mouse') open();
            });

            box.addEventListener('pointerleave', (event) => {
                if (event.pointerType === 'mouse') close();
            });

            box.addEventListener('focus', () => {
                if (box.matches(':focus-visible')) open();
            });

            box.addEventListener('blur', close);

            box.addEventListener('click', () => {
                if (!touchMode) return;
                const wasOpen = member.classList.contains('is-open');
                members.forEach((item) => {
                    if (item !== member && item.closeCard) item.closeCard();
                });
                if (wasOpen) close();
                else open();
            });

            if (finePointer && !reduceMotion) setupMotion(box, chips);
        });
    };

    const splitName = () => {
        const name = $('.brand-name');
        if (!name) return;
        const text = name.textContent.trim();
        name.textContent = '';

        [...text].forEach((char, index) => {
            const mask = create('span', 'brand-char');
            const inner = create('span', 'brand-char-inner', char);
            inner.style.setProperty('--i', index);
            mask.append(inner);
            name.append(mask);
        });
    };

    const setupHeader = () => {
        const header = $('.navbar');
        if (!header) return;
        let frame = 0;

        const update = () => {
            frame = 0;
            header.classList.toggle('is-scrolled', window.scrollY > 40);
        };

        window.addEventListener('scroll', () => {
            if (!frame) frame = requestAnimationFrame(update);
        }, { passive: true });

        update();
    };

    const setupTilt = ({ zone, target, image, depth, shift }) => {
        if (!zone || !target) return;
        const s = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };

        const render = () => {
            s.x += (s.tx - s.x) * 0.1;
            s.y += (s.ty - s.y) * 0.1;
            target.style.transform = `perspective(700px) rotateX(${-s.y * depth}deg) rotateY(${s.x * depth}deg)`;
            if (image) image.style.translate = `${-s.x * shift}px ${-s.y * shift}px`;

            const moving = Math.abs(s.tx - s.x) > 0.002 || Math.abs(s.ty - s.y) > 0.002;
            s.raf = moving ? requestAnimationFrame(render) : 0;
        };

        const kick = () => {
            if (!s.raf) s.raf = requestAnimationFrame(render);
        };

        zone.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse') return;
            const rect = target.getBoundingClientRect();
            s.tx = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1.2, 1.2);
            s.ty = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1.2, 1.2);
            kick();
        });

        zone.addEventListener('pointerleave', () => {
            s.tx = 0;
            s.ty = 0;
            kick();
        });
    };

    const setupFooter = () => {
        const plaque = $('.footer-plaque');
        if (!plaque) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            plaque.classList.add('is-in');
        } else {
            plaque.classList.add('is-arm');
            const observer = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) return;
                plaque.classList.add('is-in');
                observer.disconnect();
            }, { threshold: 0.35 });
            observer.observe(plaque);
        }

        if (finePointer && !reduceMotion) {
            setupTilt({ zone: plaque, target: plaque, image: $('img', plaque), depth: 7, shift: 8 });
        }
    };

    const setupBrand = () => {
        splitName();
        setupHeader();
        setupFooter();

        if (finePointer && !reduceMotion) {
            setupTilt({
                zone: $('.brand'),
                target: $('.brand-mark'),
                image: $('.brand-frame img'),
                depth: 14,
                shift: 2
            });
        }
    };

    const buttons = [];

    const buildLabel = (button) => {
        const label = create('span', 'fx-label');
        let index = 0;

        [...button.childNodes].forEach((node) => {
            const value = node.textContent.replace(/\s+/g, ' ').trim();
            if (!value) return;

            if (node.nodeType === 1) {
                const icon = create('span', 'fx-icon');
                icon.append(create('span', 'fx-glyph', value));
                label.append(icon);
                return;
            }

            const text = create('span', 'fx-text');
            [...value].forEach((char) => {
                const item = create('span', 'fx-char', char);
                item.style.setProperty('--i', index++);
                text.append(item);
            });
            label.append(text);
        });

        return label;
    };

    const setupButton = (button) => {
        if (button.dataset.fxReady !== undefined) return;
        button.dataset.fxReady = '';

        const name = button.textContent.replace(/\s+/g, ' ').trim();
        const base = buildLabel(button);
        const copy = base.cloneNode(true);
        const fill = create('span', 'fx-fill');
        const labels = [base, copy];
        const strength = parseFloat(button.dataset.fxStrength) || 0.32;
        const radius = parseFloat(button.dataset.fxRadius) || 80;
        const state = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };

        if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', name);
        base.setAttribute('aria-hidden', 'true');
        fill.setAttribute('aria-hidden', 'true');
        fill.append(copy);
        button.textContent = '';
        button.append(base, fill);
        button.classList.add('fx-btn');

        const circle = (r, x, y) => {
            fill.style.clipPath = `circle(${r}px at ${x}px ${y}px)`;
        };

        const point = (event) => {
            const width = button.offsetWidth;
            const height = button.offsetHeight;
            if (!event || event.clientX === undefined) return { x: width / 2, y: height / 2 };
            const rect = button.getBoundingClientRect();
            return {
                x: clamp((event.clientX - rect.left) * (width / rect.width), 0, width),
                y: clamp((event.clientY - rect.top) * (height / rect.height), 0, height)
            };
        };

        const open = (event) => {
            const { x, y } = point(event);
            const reach = Math.hypot(
                Math.max(x, button.offsetWidth - x),
                Math.max(y, button.offsetHeight - y)
            ) + 2;
            button.classList.add('is-hover');
            circle(reach, x, y);
        };

        const close = (event) => {
            const { x, y } = point(event);
            button.classList.remove('is-hover');
            circle(0, x, y);
        };

        const burst = () => {
            for (let i = 0; i < 2; i++) {
                const ring = create('span', 'fx-ring');
                ring.style.animationDelay = `${i * 140}ms`;
                ring.addEventListener('animationend', () => ring.remove());
                button.append(ring);
            }
        };

        const render = () => {
            state.x += (state.tx - state.x) * 0.14;
            state.y += (state.ty - state.y) * 0.14;
            button.style.translate = `${state.x}px ${state.y}px`;
            labels.forEach((label) => {
                label.style.translate = `${state.x * 0.35}px ${state.y * 0.35}px`;
            });
            const moving = Math.abs(state.tx - state.x) > 0.05 || Math.abs(state.ty - state.y) > 0.05;
            state.raf = moving ? requestAnimationFrame(render) : 0;
        };

        const kick = () => {
            if (!state.raf) state.raf = requestAnimationFrame(render);
        };

        const track = (event) => {
            const rect = button.getBoundingClientRect();
            const cx = rect.left + rect.width / 2 - state.x;
            const cy = rect.top + rect.height / 2 - state.y;
            const dx = event.clientX - cx;
            const dy = event.clientY - cy;
            const near = Math.abs(dx) < rect.width / 2 + radius && Math.abs(dy) < rect.height / 2 + radius;
            state.tx = near ? clamp(dx * strength, -28, 28) : 0;
            state.ty = near ? clamp(dy * strength, -20, 20) : 0;
            kick();
        };

        const reset = () => {
            state.tx = 0;
            state.ty = 0;
            kick();
        };

        const release = (event) => {
            button.classList.remove('is-pressed');
            if (event.pointerType !== 'mouse') setTimeout(() => close(event), 450);
        };

        circle(0, button.offsetWidth / 2, button.offsetHeight / 2);

        button.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'mouse') open(event);
        });

        button.addEventListener('pointerleave', (event) => {
            button.classList.remove('is-pressed');
            if (event.pointerType === 'mouse') close(event);
        });

        button.addEventListener('pointerdown', (event) => {
            button.classList.add('is-pressed');
            if (event.pointerType !== 'mouse') open(event);
        });

        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('click', burst);

        button.addEventListener('focus', () => {
            if (button.matches(':focus-visible')) open();
        });

        button.addEventListener('blur', () => {
            if (!button.matches(':hover')) close();
        });

        buttons.push({ track, reset });
    };

    const initButtons = (scope = document) => {
        if (reduceMotion) return;
        $$(BUTTON_SELECTOR, scope).forEach(setupButton);
    };

    const setupButtons = () => {
        initButtons();

        window.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse') return;
            buttons.forEach((item) => item.track(event));
        }, { passive: true });

        root.addEventListener('mouseleave', () => {
            buttons.forEach((item) => item.reset());
        });

        window.ButtonFX = { init: initButtons };
    };

    const BP_SHAPES = {
        lamp: 'M60 4V38 M34 72Q60 34 86 72Z M52 80Q60 92 68 80 M48 100H72',
        armchair: 'M24 60V44Q24 30 40 30H80Q96 30 96 44V60 M16 60H104V84H16Z M24 84V98 M96 84V98 M34 60V70 M86 60V70',
        plant: 'M60 100V50 M60 70Q36 66 34 42Q58 44 60 70 M60 56Q84 52 86 30Q62 32 60 56 M42 100H78L74 118H46Z',
        plan: 'M8 8H112V112H8Z M8 60H50 M70 60H112 M50 60A20 20 0 0 1 70 40 M60 8V30 M30 85H55V105H30Z M80 20H104V44H80Z',
        curtains: 'M20 10H100 M30 10Q22 60 32 110 M44 10Q38 60 46 110 M90 10Q98 60 88 110 M76 10Q82 60 74 110',
        sofa: 'M10 70V50Q10 36 24 36H96Q110 36 110 50V70 M4 70H116V90H4Z M10 90V100 M110 90V100 M60 36V70',
        chair: 'M34 10H78V56H34Z M30 56H82V70H30Z M34 70V112 M78 70V112',
        compass: 'M60 8A52 52 0 1 0 60.1 8Z M60 24L70 60L60 96L50 60Z M8 60H112',
        swatches: 'M14 14H50V50H14Z M70 14H106V50H70Z M14 70H50V106H14Z M70 70H106V106H70Z M70 70L106 106',
        mirror: 'M60 6Q90 6 90 56T60 114Q30 114 30 56T60 6Z M44 40Q50 24 60 20',
        mark: 'M60 20V100 M20 60H100 M60 44A16 16 0 1 0 60.1 44Z',
        ruler: 'M10 50H110V70H10Z M22 50V60 M34 50V64 M46 50V60 M58 50V64 M70 50V60 M82 50V64 M94 50V60'
    };

    const BP_PLAN = {
        '.hero': [['plan', 56, 14, 380, 0.5, -4], ['lamp', 47, -4, 170, 0.8, 0], ['armchair', 3, 66, 170, 0.3, 4], ['compass', 90, 4, 90, 0.9, 12], ['mark', 40, 84, 34, 1.2, 0]],
        '.about': [['plant', 90, 4, 150, 0.4, 0], ['swatches', 2, 78, 120, 0.7, -8], ['curtains', 56, -3, 140, 0.3, 0], ['mark', 48, 60, 30, 1.1, 0], ['ruler', 62, 84, 190, 0.5, -3]],
        '.services': [['chair', 91, 3, 130, 0.5, 6], ['lamp', 1, 80, 130, 0.8, 0], ['mirror', 82, 82, 120, 0.3, -6], ['mark', 45, 3, 28, 1.1, 0]],
        '.statement': [['plan', 70, 8, 340, 0.5, 5], ['armchair', 2, 54, 190, 0.3, -3], ['compass', 52, 76, 80, 0.9, 0], ['mark', 92, 80, 34, 1.2, 0]],
        '.team': [['curtains', 1, 2, 150, 0.3, 0], ['plant', 93, 2, 140, 0.5, 0], ['sofa', 1, 88, 200, 0.4, 0], ['swatches', 91, 90, 110, 0.7, 8], ['mark', 50, 2, 30, 1.1, 0]],
        '.cta': [['sofa', 56, 4, 240, 0.4, -3], ['lamp', 92, -6, 150, 0.8, 0], ['mark', 3, 8, 30, 1.1, 0]]
    };

    const setupBlueprints = () => {
        const items = [];
        const pointer = { x: 0, y: 0 };
        let frame = 0;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-drawn');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1 });

        Object.entries(BP_PLAN).forEach(([selector, list]) => {
            const host = $(selector);
            if (!host) return;
            list.forEach(([shape, x, y, size, depth, turn]) => {
                const svg = document.createElementNS(SVG_NS, 'svg');
                svg.setAttribute('viewBox', '0 0 120 120');
                svg.setAttribute('class', 'bp');
                svg.setAttribute('aria-hidden', 'true');
                svg.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;rotate:${turn}deg`;
                BP_SHAPES[shape].split(' M').forEach((part, index) => {
                    const path = document.createElementNS(SVG_NS, 'path');
                    path.setAttribute('d', index ? `M${part}` : part);
                    path.setAttribute('pathLength', '1');
                    path.style.setProperty('--k', index);
                    svg.append(path);
                });
                host.prepend(svg);
                observer.observe(svg);
                items.push({ host, svg, depth });
            });
        });

        const update = () => {
            frame = 0;
            const view = window.innerHeight;
            items.forEach(({ host, svg, depth }) => {
                const box = host.getBoundingClientRect();
                const offset = (box.top + box.height / 2 - view / 2) * depth * -0.22;
                svg.style.translate = `${pointer.x * depth * 34}px ${offset + pointer.y * depth * 24}px`;
            });
        };

        const queue = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        if (finePointer) {
            window.addEventListener('pointermove', (event) => {
                pointer.x = event.clientX / window.innerWidth - 0.5;
                pointer.y = event.clientY / window.innerHeight - 0.5;
                queue();
            }, { passive: true });
        }
        update();
    };

    const init = () => {
        let startReveal = () => {};

        setupMembers();
        setupBrand();

        if (!reduceMotion) {
            setupDimensions();
            setupBlueprints();
            startReveal = setupReveal();
            const scrollToY = finePointer
                ? setupSmoothScroll()
                : (y) => window.scrollTo({ top: y, behavior: 'smooth' });
            setupAnchors(scrollToY);
            setupHero();
            setupScrollEffects();
            setupButtons();
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.add('ready');
                startReveal();
            });
        });
    };

    init();
})();