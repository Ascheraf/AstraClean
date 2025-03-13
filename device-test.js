// Device Testing Utility
const DeviceTest = {
    // Focus on most common devices
    devices: {
        mobile: [
            { 
                name: 'iPhone 12/13', 
                width: 390, 
                height: 844, 
                dpr: 3, 
                userAgent: 'iPhone',
                safariVersion: 15
            },
            { 
                name: 'Samsung Galaxy S21/S22', 
                width: 360, 
                height: 800, 
                dpr: 3, 
                userAgent: 'Android',
                chromeVersion: 98
            }
        ],
        tablet: [
            { 
                name: 'iPad Air/Pro', 
                width: 820, 
                height: 1180, 
                dpr: 2, 
                userAgent: 'iPad',
                safariVersion: 15
            }
        ]
    },

    metrics: {
        deviceTests: [],
        currentDevice: null,
        detailedMetrics: new Map()
    },

    // Enhanced device-specific testing
    async testDevice(device) {
        this.metrics.currentDevice = device;
        console.log(`Testing ${device.name}...`);

        const metrics = {
            performance: await this.testPerformance(device),
            rendering: await this.testRendering(device),
            interactions: await this.testInteractions(device),
            memory: await this.testMemory(device)
        };

        this.metrics.detailedMetrics.set(device.name, metrics);
        return metrics;
    },

    // Device-specific performance testing
    async testPerformance(device) {
        const metrics = {
            fcp: await this.measureFCP(),
            lcp: await this.measureLCP(),
            cls: await this.measureCLS(),
            fid: await this.measureFID(),
            ttfb: await this.measureTTFB()
        };

        // Device-specific thresholds
        const thresholds = this.getDeviceThresholds(device);
        const issues = this.checkThresholds(metrics, thresholds);

        return { metrics, issues };
    },

    // Device-specific rendering test
    async testRendering(device) {
        const results = {
            scrollPerformance: await this.testScrolling(),
            animations: await this.testAnimations(device),
            layoutShifts: await this.measureLayoutShifts(),
            paintTimes: await this.measurePaintTimes()
        };

        // Check for device-specific rendering issues
        const issues = this.analyzeRenderingIssues(results, device);
        
        return { results, issues };
    },

    // Device-specific interaction test
    async testInteractions(device) {
        const results = {
            touchResponse: await this.measureTouchResponse(),
            scrollResponse: await this.measureScrollResponse(),
            inputLatency: await this.measureInputLatency(),
            gestureHandling: await this.testGestureHandling(device)
        };

        // Analyze interaction performance
        const issues = this.analyzeInteractionIssues(results, device);
        
        return { results, issues };
    },

    // Device-specific memory test
    async testMemory(device) {
        if (!performance.memory) return null;

        const results = {
            heapSize: performance.memory.usedJSHeapSize,
            heapLimit: performance.memory.jsHeapSizeLimit,
            totalAlloc: performance.memory.totalJSHeapSize
        };

        // Check memory usage against device limits
        const issues = this.analyzeMemoryUsage(results, device);
        
        return { results, issues };
    },

    // Get device-specific thresholds
    getDeviceThresholds(device) {
        const baseThresholds = {
            fcp: 2000,
            lcp: 2500,
            cls: 0.1,
            fid: 100,
            ttfb: 600
        };

        // Adjust thresholds based on device capabilities
        if (device.userAgent === 'iPhone' || device.userAgent === 'iPad') {
            return {
                ...baseThresholds,
                fcp: 1800,  // Safari is generally faster
                ttfb: 500   // iOS optimization
            };
        } else if (device.userAgent === 'Android') {
            return {
                ...baseThresholds,
                fcp: 2200,  // Account for Android fragmentation
                lcp: 2700   // Adjust for various Android browsers
            };
        }

        return baseThresholds;
    },

    // Check metrics against thresholds
    checkThresholds(metrics, thresholds) {
        const issues = [];
        
        Object.entries(metrics).forEach(([metric, value]) => {
            if (value > thresholds[metric]) {
                issues.push({
                    metric,
                    value,
                    threshold: thresholds[metric],
                    improvement: this.getImprovementSuggestion(metric)
                });
            }
        });

        return issues;
    },

    // Get improvement suggestions
    getImprovementSuggestion(metric) {
        const suggestions = {
            fcp: 'Consider inline critical CSS and optimizing resource loading',
            lcp: 'Optimize largest image/text loading and server response time',
            cls: 'Add size attributes to images and avoid dynamic content shifts',
            fid: 'Minimize main thread blocking and optimize event handlers',
            ttfb: 'Optimize server response time and consider CDN usage'
        };

        return suggestions[metric] || 'Review performance metrics';
    },

    // Analyze rendering issues
    analyzeRenderingIssues(results, device) {
        const issues = [];

        if (results.scrollPerformance.fps < 60) {
            issues.push({
                type: 'scroll',
                message: 'Scroll performance below 60fps',
                suggestion: 'Optimize scroll handlers and reduce paint complexity'
            });
        }

        if (results.paintTimes.average > 16) {
            issues.push({
                type: 'paint',
                message: 'High paint times detected',
                suggestion: 'Reduce paint complexity and optimize layers'
            });
        }

        return issues;
    },

    // Analyze interaction issues
    analyzeInteractionIssues(results, device) {
        const issues = [];

        if (results.touchResponse > 100) {
            issues.push({
                type: 'touch',
                message: 'Slow touch response detected',
                suggestion: 'Optimize touch handlers and reduce complexity'
            });
        }

        if (results.inputLatency > 50) {
            issues.push({
                type: 'input',
                message: 'High input latency detected',
                suggestion: 'Review input handlers and event delegation'
            });
        }

        return issues;
    },

    // Analyze memory usage
    analyzeMemoryUsage(results, device) {
        const issues = [];
        const heapUsagePercent = (results.heapSize / results.heapLimit) * 100;

        if (heapUsagePercent > 80) {
            issues.push({
                type: 'memory',
                message: 'High memory usage detected',
                suggestion: 'Review memory usage and implement cleanup'
            });
        }

        return issues;
    },

    // Start focused device testing
    async startTesting() {
        console.log('Starting focused device testing...');

        const allDevices = [
            ...this.devices.mobile,
            ...this.devices.tablet
        ];

        for (const device of allDevices) {
            const results = await this.testDevice(device);
            this.metrics.deviceTests.push({
                device: device.name,
                timestamp: new Date().toISOString(),
                results
            });

            // Log immediate issues
            this.logDeviceIssues(device.name, results);
        }

        return this.generateTestReport();
    },

    // Log device-specific issues
    logDeviceIssues(deviceName, results) {
        console.group(`Issues for ${deviceName}`);
        
        if (results.performance?.issues?.length > 0) {
            console.warn('Performance Issues:', results.performance.issues);
        }
        
        if (results.rendering?.issues?.length > 0) {
            console.warn('Rendering Issues:', results.rendering.issues);
        }
        
        if (results.interactions?.issues?.length > 0) {
            console.warn('Interaction Issues:', results.interactions.issues);
        }
        
        if (results.memory?.issues?.length > 0) {
            console.warn('Memory Issues:', results.memory.issues);
        }
        
        console.groupEnd();
    },

    // Generate comprehensive test report
    generateTestReport() {
        return {
            summary: this.generateSummary(),
            detailedResults: Object.fromEntries(this.metrics.detailedMetrics),
            recommendations: this.generateRecommendations()
        };
    },

    // Generate device-specific recommendations
    generateRecommendations() {
        const recommendations = new Map();

        for (const [deviceName, metrics] of this.metrics.detailedMetrics) {
            const deviceRecs = {
                critical: [],
                important: [],
                optional: []
            };

            // Analyze metrics and categorize recommendations
            this.analyzeMetricsForRecommendations(metrics, deviceRecs);
            
            recommendations.set(deviceName, deviceRecs);
        }

        return Object.fromEntries(recommendations);
    },

    // Analyze metrics for recommendations
    analyzeMetricsForRecommendations(metrics, recommendations) {
        // Performance recommendations
        if (metrics.performance?.issues) {
            metrics.performance.issues.forEach(issue => {
                if (issue.value > issue.threshold * 1.5) {
                    recommendations.critical.push(issue.improvement);
                } else {
                    recommendations.important.push(issue.improvement);
                }
            });
        }

        // Rendering recommendations
        if (metrics.rendering?.issues) {
            metrics.rendering.issues.forEach(issue => {
                recommendations.important.push(issue.suggestion);
            });
        }

        // Other recommendations
        if (metrics.memory?.issues) {
            metrics.memory.issues.forEach(issue => {
                recommendations.optional.push(issue.suggestion);
            });
        }
    }
};

// Export the testing utility
window.DeviceTest = DeviceTest;
