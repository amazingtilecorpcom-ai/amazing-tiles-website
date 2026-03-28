document.addEventListener('DOMContentLoaded', () => {
    // Prevent CSS transitions firing on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        document.body.classList.add('resize-animation-stopper');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
        }, 400);
    });

    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    /* =======================================
       Hero Entrance Animation
       ======================================= */
    const heroTl = gsap.timeline({
        defaults: { ease: 'power4.out', duration: 1.5 }
    });

    heroTl
        .to('.hero-headline .mask span', {
            y: '0%',
            stagger: 0.1,
            delay: 0.5
        })
        .to('.hero-subheadline .mask span', {
            y: '0%',
            stagger: 0.1
        }, '-=1.2')
        .to('.hero-cta.mask span', {
            y: '0%',
            duration: 1
        }, '-=1.2')
        .from('.hero-bg', {
            scale: 1.2,
            duration: 2.5,
            ease: 'power2.out'
        }, 0);

    /* =======================================
       Scroll Reveal Animations
       ======================================= */

    // Generic Fade Reveal for Headers
    document.querySelectorAll('.section-header h2, .section-header p').forEach(el => {
        gsap.fromTo(el,
            { y: 30, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 95%',
                },
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out'
            }
        );
    });

    // Services Stagger
    gsap.fromTo('.service-card',
        { y: 60, opacity: 0 },
        {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 80%',
            },
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        }
    );

    // Projects stagger (Vertical Cards)
    gsap.fromTo('.project-vertical-card',
        { y: 60, opacity: 0 },
        {
            scrollTrigger: {
                trigger: '.projects-vertical-grid',
                start: 'top 80%',
            },
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        }
    );

    // Stats counter
    const stats = document.querySelectorAll('.counter');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        gsap.to(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 90%',
            },
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out'
        });
    });

    /* =======================================
       Navbar Scroll State
       ======================================= */
    const navbar = document.getElementById('navbar');

    ScrollTrigger.create({
        start: 'top -50',
        onUpdate: (self) => {
            if (self.direction === 1) {
                navbar.classList.add('scrolled');
            } else if (self.scroll() < 50) {
                navbar.classList.remove('scrolled');
            }
        }
    });

    /* =======================================
       Mobile Menu Navigation
       ======================================= */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-link');
    let menuOpen = false;

    hamburger.addEventListener('click', () => {
        if (!menuOpen) {
            navLinks.classList.add('active');
            hamburger.classList.add('active');
            menuOpen = true;
        } else {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            menuOpen = false;
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            menuOpen = false;
        });
    });


});
