// Performance Monitoring Utility
const PerfMonitor = {
    metrics: {
        fps: [],
        memory: [],
        paintTimes: [],
        layoutTimes: [],
        scriptTimes: []
    },

    startTime: performance.now(),

    // Monitor FPS
    measureFPS() {
        let lastTime = performance.now();
        let frames = 0;

        const calculateFPS = () => {
            const now = performance.now();
            frames++;

            if (now >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                this.metrics.fps.push(fps);
                frames = 0;
                lastTime = now;
                
                // Log if FPS drops below threshold
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                }
            }

            requestAnimationFrame(calculateFPS);
        };

        requestAnimationFrame(calculateFPS);
    },

    // Monitor Memory Usage
    measureMemory() {
        if (performance.memory) {
            setInterval(() => {
                const memory = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize / (1024 * 1024),
                    totalJSHeapSize: performance.memory.totalJSHeapSize / (1024 * 1024)
                };
                this.metrics.memory.push(memory);

                // Log if memory usage is high
                if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.8) {
                    console.warn('High memory usage detected');
                }
            }, 1000);
        }
    },

    // Monitor Paint Performance
    measurePaint() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'paint') {
                    this.metrics.paintTimes.push({
                        type: entry.name,
                        duration: entry.duration
                    });

                    // Log slow paint operations
                    if (entry.duration > 16.67) { // 60fps threshold
                        console.warn(`Slow paint operation: ${entry.duration}ms`);
                    }
                }
            }
        });

        observer.observe({ entryTypes: ['paint'] });
    },

    // Monitor Layout Performance
    measureLayout() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.metrics.layoutTimes.push({
                    type: entry.entryType,
                    duration: entry.duration
                });

                // Log layout thrashing
                if (entry.duration > 10) {
                    console.warn(`Layout thrashing detected: ${entry.duration}ms`);
                }
            }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
    },

    // Monitor Script Performance
    measureScriptPerformance() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'longtask') {
                    this.metrics.scriptTimes.push({
                        duration: entry.duration,
                        startTime: entry.startTime
                    });

                    // Log long tasks
                    if (entry.duration > 50) {
                        console.warn(`Long task detected: ${entry.duration}ms`);
                    }
                }
            }
        });

        observer.observe({ entryTypes: ['longtask'] });
    },

    // Get Performance Summary
    getSummary() {
        const now = performance.now();
        const runtime = (now - this.startTime) / 1000;

        const avgFPS = this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length || 0;
        const minFPS = Math.min(...this.metrics.fps) || 0;

        const lastMemory = this.metrics.memory[this.metrics.memory.length - 1] || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
        
        const avgPaintTime = this.metrics.paintTimes.reduce((a, b) => a + b.duration, 0) / this.metrics.paintTimes.length || 0;
        
        return {
            runtime: `${runtime.toFixed(2)}s`,
            fps: {
                average: avgFPS.toFixed(2),
                minimum: minFPS,
                drops: this.metrics.fps.filter(fps => fps < 30).length
            },
            memory: {
                used: `${lastMemory.usedJSHeapSize.toFixed(2)}MB`,
                total: `${lastMemory.totalJSHeapSize.toFixed(2)}MB`
            },
            paint: {
                averageTime: `${avgPaintTime.toFixed(2)}ms`,
                operations: this.metrics.paintTimes.length
            },
            layoutShifts: this.metrics.layoutTimes.length,
            longTasks: this.metrics.scriptTimes.filter(task => task.duration > 50).length
        };
    },

    // Start Monitoring
    start() {
        this.measureFPS();
        this.measureMemory();
        this.measurePaint();
        this.measureLayout();
        this.measureScriptPerformance();

        console.log('Performance monitoring started');
    }
};

// Mobile-specific monitoring
const MobileMonitor = {
    metrics: {
        touchResponsiveness: [],
        scrollPerformance: [],
        resizeEvents: [],
        orientationChanges: [],
        networkInfo: null
    },

    // Monitor touch responsiveness
    measureTouchResponse() {
        document.addEventListener('touchstart', (e) => {
            const startTime = performance.now();
            
            const trackTouchEnd = () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.metrics.touchResponsiveness.push(duration);
                
                // Log if touch response is slow
                if (duration > 100) {
                    console.warn(`Slow touch response: ${duration.toFixed(2)}ms`);
                }
                
                document.removeEventListener('touchend', trackTouchEnd);
            };
            
            document.addEventListener('touchend', trackTouchEnd);
        });
    },

    // Monitor scroll performance
    measureScrollPerformance() {
        let lastScrollTime = performance.now();
        let scrollEvents = 0;
        
        window.addEventListener('scroll', () => {
            const now = performance.now();
            scrollEvents++;
            
            if (now - lastScrollTime >= 1000) {
                this.metrics.scrollPerformance.push({
                    events: scrollEvents,
                    duration: now - lastScrollTime
                });
                
                // Log if scroll performance is poor
                if (scrollEvents > 60) {
                    console.warn(`High scroll event frequency: ${scrollEvents} events/second`);
                }
                
                scrollEvents = 0;
                lastScrollTime = now;
            }
        }, { passive: true });
    },

    // Monitor resize events
    measureResizeEvents() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            if (!resizeTimeout) {
                const startTime = performance.now();
                
                resizeTimeout = setTimeout(() => {
                    const duration = performance.now() - startTime;
                    this.metrics.resizeEvents.push(duration);
                    
                    // Log if resize handling is slow
                    if (duration > 100) {
                        console.warn(`Slow resize handling: ${duration.toFixed(2)}ms`);
                    }
                    
                    resizeTimeout = null;
                }, 150);
            }
        });
    },

    // Monitor orientation changes
    measureOrientationChanges() {
        window.addEventListener('orientationchange', () => {
            const startTime = performance.now();
            
            const checkOrientation = () => {
                if (document.readyState === 'complete') {
                    const duration = performance.now() - startTime;
                    this.metrics.orientationChanges.push(duration);
                    
                    // Log if orientation change is slow
                    if (duration > 300) {
                        console.warn(`Slow orientation change: ${duration.toFixed(2)}ms`);
                    }
                } else {
                    requestAnimationFrame(checkOrientation);
                }
            };
            
            checkOrientation();
        });
    },

    // Get network information
    checkNetworkConditions() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            this.metrics.networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
            // Log if network conditions are poor
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.warn('Poor network conditions detected');
            }
        }
    },

    // Get mobile performance summary
    getMobileSummary() {
        const avgTouchResponse = this.metrics.touchResponsiveness.reduce((a, b) => a + b, 0) 
            / this.metrics.touchResponsiveness.length || 0;
            
        const avgScrollEvents = this.metrics.scrollPerformance.reduce((a, b) => a + b.events, 0) 
            / this.metrics.scrollPerformance.length || 0;
            
        const avgResizeTime = this.metrics.resizeEvents.reduce((a, b) => a + b, 0) 
            / this.metrics.resizeEvents.length || 0;
            
        const avgOrientationChange = this.metrics.orientationChanges.reduce((a, b) => a + b, 0) 
            / this.metrics.orientationChanges.length || 0;
        
        return {
            touch: {
                averageResponse: `${avgTouchResponse.toFixed(2)}ms`,
                slowResponses: this.metrics.touchResponsiveness.filter(t => t > 100).length
            },
            scroll: {
                averageEventsPerSecond: avgScrollEvents.toFixed(2),
                samples: this.metrics.scrollPerformance.length
            },
            resize: {
                averageTime: `${avgResizeTime.toFixed(2)}ms`,
                samples: this.metrics.resizeEvents.length
            },
            orientation: {
                averageTime: `${avgOrientationChange.toFixed(2)}ms`,
                changes: this.metrics.orientationChanges.length
            },
            network: this.metrics.networkInfo
        };
    },

    // Start mobile monitoring
    start() {
        this.measureTouchResponse();
        this.measureScrollPerformance();
        this.measureResizeEvents();
        this.measureOrientationChanges();
        this.checkNetworkConditions();
        
        console.log('Mobile performance monitoring started');
    }
};

// Add mobile monitoring to main PerfMonitor
PerfMonitor.mobile = MobileMonitor;

// Start both monitors when in mobile context
if (window.matchMedia('(max-width: 768px)').matches) {
    document.addEventListener('DOMContentLoaded', () => {
        PerfMonitor.start();
        PerfMonitor.mobile.start();
        
        // Log combined performance summary after 5 seconds
        setTimeout(() => {
            console.log('Performance Summary:', {
                general: PerfMonitor.getSummary(),
                mobile: PerfMonitor.mobile.getMobileSummary()
            });
        }, 5000);
    });
}

// Export the monitor
window.PerfMonitor = PerfMonitor;
