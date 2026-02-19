export const Config = {
    aceOfShadows: {
        cardCount: 144,
        cardMoveLoopIntervalS: 1,
        cardAnimationDurationS: 2,
        stackOffsetY: 0.3,
        stackSpacing: 50
    },
    magicWords: {
        apiUrl: 'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
        autoChangeIntervalS: 3,
        firstPhraseDelayS: 0.3,
        layout: {
            // Typography
            nameFontSize: 14,
            contentFontSize: 16,
            contentFill: 0x333333,
            emojiScale: 1,
            nameColorLeft: 0x1565C0,
            nameColorRight: 0x7B1FA2,
            // Spacing
            cornerGap: 10,
            bubbleGap: -7,
            contentGapWithTail: 30,
            contentGapBottom: 20,
            contentGapSide: 15,
            bubbleWidthRatio: 0.8,
            // Animation
            slideOffset: 40,
            bubbleFadeDelay: 0.15,
            // 9-slice borders for speech-bubble.png
            bubbleSliceLeft: 38,
            bubbleSliceTop: 25,
            bubbleSliceRight: 25,
            bubbleSliceBottom: 50,
        }
    },
    phoenixFlame: {
        maxParticles: 10,
        particleLifetimeS: { min: 1.4, max: 1.7 },
        particleTextureCount: 3,
        particleLifeSplitRatio: 0.35,
        particleEaseIn: 'expo.out',
        particleEaseOut: 'power3.in',
    }
} as const;

