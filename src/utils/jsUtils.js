export const addWindowListeners = (callback) => {
    window.addEventListener('resize', callback);
    window.addEventListener('orientationchange', callback);
    window.addEventListener('fullscreenchange', callback);
    window.visualViewport && (window.visualViewport.addEventListener('scroll', callback));
    window.visualViewport && (window.visualViewport.addEventListener('resize', callback));
}

export const removeWindowListeners = (callback) => {
    window.removeEventListener('resize', callback);
    window.removeEventListener('orientationchange', callback);
    window.removeEventListener('fullscreenchange', callback);
    window.visualViewport && (window.visualViewport.removeEventListener('scroll', callback));
    window.visualViewport && (window.visualViewport.removeEventListener('resize', callback));
}

export const cinematicResize = (element) => {
    return () => {
        const resizeElement = element;
        const DPR = window.devicePixelRatio || 1;
        const ratioTargets = [
            {
                minRatio: 1,
                ratio: { x: 1920, y: 1080 }
            },
            {
                minRatio: 0,
                ratio: { x: 1920, y: 1920 }
            },
        ];

        const screen = {
            w: window.innerWidth,
            h: window.innerHeight,
            r: window.innerWidth / window.innerHeight
        }

        let target = null;
        let counter = 0;

        while (target === null) {
            if(screen.r > ratioTargets[counter].minRatio) {
                target = ratioTargets[counter];
            } else {
                counter++;
            }
        }

        const resizeRatio = Math.min(screen.w / target.ratio.x, screen.h / target.ratio.y);
        resizeElement.style.width = target.ratio.x * resizeRatio + 'px';
        resizeElement.style.height = target.ratio.y * resizeRatio + 'px';
        resizeElement.width = target.ratio.x * resizeRatio * DPR;
        resizeElement.height = target.ratio.y * resizeRatio * DPR;

    }

}
