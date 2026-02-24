import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import gsap from 'gsap'
import { useMagneticEffect, useTiltEffect } from './hooks/useAnimations'

/* ===== ANIMATION VARIANTS ===== */
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }
    })
}

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

/* ===== CUSTOM CURSOR COMPONENT ===== */
function CustomCursor() {
    const dotRef = useRef(null)
    const ringRef = useRef(null)
    const [isActive, setIsActive] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const mouse = useRef({ x: 0, y: 0 })
    const ring = useRef({ x: 0, y: 0 })

    useEffect(() => {
        if (window.innerWidth < 768) return

        const handleMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY }
            if (dotRef.current) {
                dotRef.current.style.left = e.clientX + 'px'
                dotRef.current.style.top = e.clientY + 'px'
            }
            setIsVisible(true)
        }

        const handleLeave = () => setIsVisible(false)

        let raf
        const animateRing = () => {
            ring.current.x += (mouse.current.x - ring.current.x) * 0.15
            ring.current.y += (mouse.current.y - ring.current.y) * 0.15
            if (ringRef.current) {
                ringRef.current.style.left = ring.current.x + 'px'
                ringRef.current.style.top = ring.current.y + 'px'
            }
            raf = requestAnimationFrame(animateRing)
        }

        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseleave', handleLeave)
        raf = requestAnimationFrame(animateRing)

        const addListeners = () => {
            document.querySelectorAll('a, button, .project-card, .contact-link, .hero-cta, .process-step, .testimonial-card').forEach(el => {
                el.addEventListener('mouseenter', () => setIsActive(true))
                el.addEventListener('mouseleave', () => setIsActive(false))
            })
        }
        const timer = setTimeout(addListeners, 2000)

        return () => {
            document.removeEventListener('mousemove', handleMove)
            document.removeEventListener('mouseleave', handleLeave)
            cancelAnimationFrame(raf)
            clearTimeout(timer)
        }
    }, [])

    if (typeof window !== 'undefined' && window.innerWidth < 768) return null

    return (
        <>
            <div ref={dotRef} className={`cursor-dot ${isActive ? 'active' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }} />
            <div ref={ringRef} className={`cursor-ring ${isActive ? 'active' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }} />
        </>
    )
}

/* ===== LOADER COMPONENT ===== */
function Loader({ onComplete }) {
    const [progress, setProgress] = useState(0)
    const letters = 'AJASYA'.split('')

    useEffect(() => {
        let current = 0
        const interval = setInterval(() => {
            current += Math.random() * 12 + 5
            if (current >= 100) {
                current = 100
                setProgress(100)
                clearInterval(interval)
                setTimeout(onComplete, 600)
            } else {
                setProgress(Math.round(current))
            }
        }, 180)
        return () => clearInterval(interval)
    }, [onComplete])

    return (
        <motion.div
            className="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="loader-text">
                {letters.map((letter, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </div>
            <div className="loader-bar">
                <motion.div className="loader-bar-fill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </motion.div>
    )
}

/* ===== HEADER COMPONENT ===== */
function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const lastScroll = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY
            setScrolled(y > 100)
            setHidden(y > lastScroll.current && y > 300)
            lastScroll.current = y
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollTo = useCallback((id) => {
        setMobileOpen(false)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    const navLinks = [
        { label: 'About', id: 'about' },
        { label: 'Work', id: 'work' },
        { label: 'Kind Words', id: 'testimonials' },
        { label: 'Contact', id: 'contact' },
    ]

    return (
        <>
            <motion.header
                className={`header ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <a href="#hero" className="header-brand" onClick={(e) => { e.preventDefault(); scrollTo('hero') }}>
                    Ajasya Bisen<sup>®</sup>
                </a>
                <nav className="header-nav">
                    <span className="nav-label">Quick Links</span>
                    {navLinks.map(link => (
                        <a key={link.id} href={`#${link.id}`} className="nav-link"
                            onClick={(e) => { e.preventDefault(); scrollTo(link.id) }}>
                            {link.label}
                        </a>
                    ))}
                </nav>
                <button className={`menu-toggle ${mobileOpen ? 'active' : ''}`}
                    onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                    <span /><span />
                </button>
            </motion.header>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div className="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {navLinks.map((link, i) => (
                            <motion.a key={link.id} href={`#${link.id}`} className="mobile-link"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                onClick={(e) => { e.preventDefault(); scrollTo(link.id) }}
                            >
                                {link.label}
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

/* ===== HERO SECTION ===== */
function Hero() {
    const magneticRef = useMagneticEffect(0.25)

    return (
        <section className="hero" id="hero">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
                <motion.p className="hero-tag" variants={fadeUp} custom={0}>
                    CREATIVE CONTENT WRITER — STORYTELLER
                </motion.p>
                <h1 className="hero-headline">
                    {['Crafting Words', 'and Narratives that', 'Connect & Leave a'].map((line, i) => (
                        <motion.span key={i} className="hero-line" variants={fadeUp} custom={i + 1}>
                            {line}
                        </motion.span>
                    ))}
                    <motion.span className="hero-line hero-line-accent" variants={fadeUp} custom={4}>
                        Bold Impression.
                    </motion.span>
                </h1>
                <motion.div className="hero-bottom" variants={fadeUp} custom={5}>
                    <a href="#work" ref={magneticRef} className="hero-cta"
                        onClick={(e) => { e.preventDefault(); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }) }}>
                        <span className="cta-text">SEE WORKS</span>
                        <span className="cta-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </span>
                    </a>
                    <p className="hero-description">
                        I create compelling stories, persuasive copy, and engaging content that transforms brand voices and captivates audiences.
                    </p>
                </motion.div>
            </motion.div>
            <motion.div className="hero-scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 2.5, duration: 1 }}
            >
                <span>SCROLL</span>
                <div className="scroll-line" />
            </motion.div>
        </section>
    )
}

/* ===== MARQUEE COMPONENT ===== */
function Marquee({ items, large, reverse }) {
    const content = large ? (
        <div className={`marquee-track ${large ? 'marquee-track-large' : ''}`}>
            {items.map((item, i) => (
                <span key={i} className={`marquee-item-large ${i % 2 === 1 ? 'marquee-item-outline' : ''}`}>{item}</span>
            ))}
        </div>
    ) : (
        <div className="marquee-track">
            {[...items, ...items].map((item, i) => (
                <span key={i}>
                    <span className="marquee-item">{item}</span>
                    <span className="marquee-separator">✦</span>
                </span>
            ))}
        </div>
    )

    return (
        <section className={`marquee-section ${large ? 'marquee-section-large' : ''}`}>
            <div className={`marquee ${reverse ? 'marquee-reverse' : ''}`}>
                {content}
            </div>
        </section>
    )
}

/* ===== ABOUT SECTION ===== */
function About() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })
    const imageY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])
    const smoothY = useSpring(imageY, { stiffness: 100, damping: 30 })

    const statsRef = useRef(null)
    const statsInView = useInView(statsRef, { once: true, amount: 0.5 })

    return (
        <section className="about" id="about" ref={ref}>
            <div className="about-grid">
                <motion.div className="about-left"
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={staggerContainer}
                >
                    <motion.span className="section-label" variants={fadeUp}>( ABOUT ME )</motion.span>
                    <motion.h2 className="about-headline" variants={fadeUp}>
                        A writer who believes<br />
                        <em>every brand has a story</em><br />
                        worth telling.
                    </motion.h2>
                </motion.div>

                <div className="about-right">
                    <motion.div className="about-image-wrapper"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <motion.img
                            src="/assets/portrait.png"
                            alt="Ajasya Bisen"
                            className="about-image"
                            style={{ y: smoothY }}
                        />
                    </motion.div>

                    <motion.div className="about-text"
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                        variants={staggerContainer}
                    >
                        <motion.p variants={fadeUp}>
                            I'm Ajasya Bisen, a 20-year-old creative content writer with over 6 months of professional experience crafting compelling narratives that resonate with audiences.
                        </motion.p>
                        <motion.p variants={fadeUp}>
                            From brand storytelling and persuasive copy to SEO-optimized blogs and social media content — I turn ideas into words that move people and drive results.
                        </motion.p>
                    </motion.div>

                    <motion.div className="about-stats" ref={statsRef}
                        initial="hidden"
                        animate={statsInView ? 'visible' : 'hidden'}
                        variants={staggerContainer}
                    >
                        {[
                            { number: 6, suffix: '+', label: 'Months Experience' },
                            { number: 50, suffix: '+', label: 'Projects Completed' },
                            { number: 20, suffix: '+', label: 'Happy Clients' },
                        ].map((stat, i) => (
                            <motion.div className="stat" key={i} variants={fadeUp} custom={i}>
                                <CountUp target={stat.number} suffix={stat.suffix} active={statsInView} />
                                <span className="stat-label">{stat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ===== COUNT UP COMPONENT ===== */
function CountUp({ target, suffix = '', active }) {
    const [count, setCount] = useState(0)
    const hasRun = useRef(false)

    useEffect(() => {
        if (!active || hasRun.current) return
        hasRun.current = true
        let current = 0
        const step = target / 50
        const interval = setInterval(() => {
            current += step
            if (current >= target) {
                setCount(target)
                clearInterval(interval)
            } else {
                setCount(Math.ceil(current))
            }
        }, 30)
        return () => clearInterval(interval)
    }, [active, target])

    return <span className="stat-number">{count}{suffix}</span>
}

/* ===== WORK SECTION — Single Featured Project ===== */
function Work() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section className="work" id="work" ref={ref}>
            <div className="work-header">
                <motion.span className="section-label" variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
                    ( FEATURED WORK )
                </motion.span>
                <motion.h2 className="work-title"
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    Selected<br />Project
                </motion.h2>
            </div>
            <motion.a
                href="https://ajasyabisen.medium.com/the-weight-of-feeling-behind-621673435d36"
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 0.985 }}
                style={{ display: 'block', textDecoration: 'none', color: 'inherit', aspectRatio: 'auto' }}
            >
                <div className="project-card-inner" style={{ minHeight: '400px', aspectRatio: '16/7', overflow: 'hidden' }}>
                    <div className="project-card-bg" />
                    <div className="project-card-content">
                        <h3 className="project-name" style={{ fontSize: 'var(--fs-xl)', marginBottom: '1rem' }}>
                            The Weight of<br />Feeling Behind
                        </h3>
                        <p className="project-desc" style={{ opacity: 0.6, transform: 'none', maxWidth: '500px', marginBottom: '1.5rem' }}>
                            A deep, introspective piece exploring the emotional weight we carry — the feelings left unsaid, the moments that linger, and the courage it takes to move forward.
                        </p>
                        <div className="project-tags" style={{ opacity: 1, transform: 'none' }}>
                            <span>Creative Writing</span>
                            <span>Medium</span>
                            <span>Personal Essay</span>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            READ ON MEDIUM
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </div>
                    </div>
                    <span className="project-number" style={{ opacity: 0.3 }}>(01)</span>
                </div>
            </motion.a>
        </section>
    )
}

/* ===== PROCESS SECTION ===== */
const processSteps = [
    { title: 'Discover', desc: 'Deep dive into your brand, audience, and goals. Understanding the core message before writing a single word.' },
    { title: 'Strategize', desc: 'Building a content roadmap with the right tone, structure, and keywords to maximize impact and reach.' },
    { title: 'Create', desc: 'Crafting compelling narratives that balance creativity with purpose. Every word is intentional and powerful.' },
    { title: 'Refine', desc: 'Polishing and perfecting every piece until it shines. Iterating based on feedback to ensure excellence.' },
]

function Process() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section className="process" ref={ref}>
            <div className="process-header">
                <motion.span className="section-label" variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
                    ( MY PROCESS )
                </motion.span>
                <motion.h2 className="process-title"
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    How I Craft<br />Every Piece
                </motion.h2>
            </div>
            <div className="process-grid">
                {processSteps.map((step, i) => (
                    <motion.div key={i} className="process-step"
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="process-number">{String(i + 1).padStart(2, '0')}</span>
                        <h3 className="process-step-title">{step.title}</h3>
                        <p>{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

/* ===== TESTIMONIALS SECTION ===== */
const testimonials = [
    { text: "Ajasya transformed our brand voice completely. His writing doesn't just inform — it captivates and converts. Truly exceptional talent.", name: 'Ravi Sharma', role: 'Founder, TechStart India' },
    { text: "Working with Ajasya was a game-changer for our content strategy. His SEO articles consistently rank on page one and drive real traffic.", name: 'Priya Mehta', role: 'Marketing Head, BrandCraft' },
    { text: "His ability to capture a brand's essence in words is remarkable. Every piece he delivered was polished, on-brand, and engaging.", name: 'Ankit Verma', role: 'CEO, CreativeEdge' },
]

function Testimonials() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section className="testimonials" id="testimonials" ref={ref}>
            <div className="testimonials-header">
                <motion.span className="section-label" variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
                    ( KIND WORDS )
                </motion.span>
                <motion.h2 className="testimonials-title"
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    What Clients<br />Say
                </motion.h2>
            </div>
            <div className="testimonials-grid">
                {testimonials.map((t, i) => (
                    <motion.div key={i} className="testimonial-card"
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                        transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    >
                        <div className="testimonial-quote">"</div>
                        <p className="testimonial-text">{t.text}</p>
                        <div className="testimonial-author">
                            <span className="testimonial-name">{t.name}</span>
                            <span className="testimonial-role">{t.role}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

/* ===== CONTACT SECTION ===== */
const contactLinks = [
    { label: 'Email Me', href: 'mailto:ajasyabisen@gmail.com' },
    { label: 'Call Me', href: 'tel:+919140743736' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ajasya-bisen-096715332' },
    { label: 'Medium', href: 'https://ajasyabisen.medium.com/' },
    { label: 'Instagram', href: 'https://www.instagram.com/ajasya_.x' },
]

function Contact() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section className="contact" id="contact" ref={ref}>
            <div className="contact-content">
                <motion.span className="section-label" variants={fadeUp}
                    initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
                    ( GET IN TOUCH )
                </motion.span>
                <motion.h2 className="contact-headline"
                    initial={{ opacity: 0, y: 80 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    Let's Create<br />
                    Something<br />
                    <em>Remarkable.</em>
                </motion.h2>

                <div className="contact-links">
                    {contactLinks.map((link, i) => (
                        <motion.a key={i} href={link.href}
                            target={link.href.startsWith('http') ? '_blank' : undefined}
                            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="contact-link"
                            initial={{ opacity: 0, x: -40 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ paddingLeft: '1.5rem' }}
                        >
                            <span>{link.label}</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ===== FOOTER ===== */
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-copy">© {new Date().getFullYear()} AJASYA BISEN</span>
                    <span className="footer-tagline">WORDS THAT MOVE ✦ STORIES THAT STAY</span>
                </div>
                <motion.div className="footer-right"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <span className="footer-craft">Craft.</span>
                </motion.div>
            </div>
        </footer>
    )
}

/* ===== MAIN APP ===== */
export default function App() {
    const [loading, setLoading] = useState(true)

    const services = ['Copywriting', 'Brand Storytelling', 'Blog Writing', 'SEO Content', 'Creative Writing', 'Social Media', 'Script Writing', 'Email Campaigns']
    const featuredItems = ['Featured Works©', 'Featured Works©', 'Featured Works©', 'Featured Works©', 'Featured Works©', 'Featured Works©']

    return (
        <>
            <CustomCursor />
            <AnimatePresence mode="wait">
                {loading && <Loader key="loader" onComplete={() => setLoading(false)} />}
            </AnimatePresence>

            {!loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Header />
                    <Hero />
                    <Marquee items={services} />
                    <About />
                    <Work />
                    <Marquee items={featuredItems} large reverse />
                    <Process />
                    <Testimonials />
                    <Contact />
                    <Footer />
                </motion.div>
            )}
        </>
    )
}
