
/**
 * Vietnam Travel Hub 50.0 - Global Utility Script
 * Developed by DMP AI Dev
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("%c Vietnam Travel Hub v50.0 Initialized ", "background: #007AFF; color: white; font-weight: bold; padding: 4px; border-radius: 4px;");
    
    // Parallax Effect for Hero Images
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-bg');
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
    });

    // Device Motion / Orientation check for 3D card effects (if needed)
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            // Logic for tilt-based UI interactions could go here
        }, true);
    }

    // Performance Monitoring for AI Generation
    window.trackAIPerformance = (taskName, startTime) => {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        console.debug(`[AI Perf] ${taskName} took ${duration}ms`);
    };

    // Global click handler for iOS "Tap" sound effects or haptics simulation
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('button')) {
            // Optional: simulate haptic feedback for supported devices
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        }
    });
});
