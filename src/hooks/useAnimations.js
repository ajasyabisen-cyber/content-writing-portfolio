import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useMagneticEffect(strength = 0.3) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el || window.innerWidth < 768) return

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect()
            const x = e.clientX - rect.left - rect.width / 2
            const y = e.clientY - rect.top - rect.height / 2
            gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' })
        }

        const handleLeave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
        }

        el.addEventListener('mousemove', handleMove)
        el.addEventListener('mouseleave', handleLeave)
        return () => {
            el.removeEventListener('mousemove', handleMove)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [strength])

    return ref
}

export function useTiltEffect(intensity = 10) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el || window.innerWidth < 768) return

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width - 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5
            gsap.to(el, {
                rotateX: -y * intensity,
                rotateY: x * intensity,
                transformPerspective: 1000,
                duration: 0.4,
                ease: 'power2.out'
            })
        }

        const handleLeave = () => {
            gsap.to(el, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.7,
                ease: 'elastic.out(1, 0.6)'
            })
        }

        el.addEventListener('mousemove', handleMove)
        el.addEventListener('mouseleave', handleLeave)
        return () => {
            el.removeEventListener('mousemove', handleMove)
            el.removeEventListener('mouseleave', handleLeave)
        }
    }, [intensity])

    return ref
}
