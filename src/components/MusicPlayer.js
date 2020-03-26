// libs
import React from 'react';

// components
import { CanvasViz } from './CanvasViz';
import { EffectsPanel } from './EffectsPanel';
import { FreqBands } from './FreqBands';
import { MenuButtonParent } from './menu-button/MenuButtonParent';
import { SongInfoPanel } from './SongInfoPanel';
import { ToggleButtonPanel } from './toggle-button/ToggleButtonPanel';
import { HomePanel } from './HomePanel';
import { AudioPlayerWrapper } from '../classes/AudioPlayerWrapper';

// context
import { MusicPlayerContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

// reducers
import { MusicPlayerReducer } from '../reducers/MusicPlayerReducer';

// other
import { createAudioPlayer } from 'crco-utils';
import { getPathToAudio } from '../utils/audioUtils';

// styles
import '../styles/components/MusicPlayer.scss';

export const MusicPlayer = (props) => {

    const { flags } = React.useContext(TestingContext);

    const {
        id,
        timeSignature,
        bpm,
        groups,
        ambientTrack,
        ambientTrackLength,
    } = React.useContext(SongContext);

    const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
        audioCtx: props.audioCtx,
        scheduler: props.scheduler,
        premaster: props.premaster,
        isLoading: true,
        backgroundMode: false,
        randomizeEffects: false,
        pauseVisuals: false,
        mute: false,
        players: [],
        analysers: [],
        highpass: 1,
        lowpass: 100,
        ambience: 1
    });

    const backgroundModeEventRef = React.useRef(null);

    /* Randomize Callback */
    const handleRandomize = React.useCallback(() => {

        const voicesToEnable = [];

        groups.forEach((g) => {

            // get the effective poly; the max number of voices to enable
            const ePoly = g.polyphony === -1 ? g.voices.length : g.polyphony;

            // ensures 1 voice from each group is enabled
            const count = Math.ceil(Math.random() * ePoly);

            // keep track of how many are enabled in each group
            const groupCount = []

            while (groupCount.length < count) {
                const rand = Math.floor(Math.random() * g.voices.length);
                const id = g.voices[rand].name;
                if (groupCount.indexOf(id) === -1) {
                    groupCount.push(id);
                    voicesToEnable.push(id);
                }
            }

        });

        state.players.forEach((p) => {
            if (voicesToEnable.indexOf(p.id) !== -1) {
                if (p.playerState === 'stopped') {
                    p.buttonRef.click();
                }
            } else {
                if (p.playerState !== 'stopped') {
                    p.buttonRef.click();
                }
            }
        });

    }, [state.players, groups]);

    /* Reset Callback */
    const handleReset = React.useCallback(() => {

        // take the simple route - click the players!
        const activePlayers = state.players.filter((p) => (p.playerState === 'active' || p.playerState === 'pending-start'));
        activePlayers.forEach((p) => p.buttonRef.click());

    }, [state.players]);

    /* Background Mode Callback */
    const triggerRandomVoice = React.useCallback(() => {

        const viableOne = state.players.filter((p) => !p.playerState.includes('pending'));
        const randomOne = Math.floor(Math.random() * viableOne.length);
        state.players[randomOne].buttonRef.click();

        // trigger an additional voice when less than 1/2 are active
        if (viableOne.length >= state.players.length) {
            const viableTwo = viableOne.filter((p, i) => i !== randomOne && p.groupName !== randomOne.groupName);
            const randomTwo = Math.floor(Math.random() * viableTwo.length);
            state.players[randomTwo].buttonRef.click();
        }

    }, [state.players]);

    /* Ambient Track Hook */
    React.useEffect(() => {

        let ambientPlayer;

        if (flags.playAmbientTrack && ambientTrack) {

            const pathToAudio = getPathToAudio(id, 'ambient-track', 'vbr');

            createAudioPlayer(state.audioCtx, pathToAudio, {
                offlineRendering: true,
                renderLength: state.sampleRate * parseInt(ambientTrackLength) * timeSignature * 60 / bpm,
                fade: true,
                fadeLength: 0.01
            }).then((audioPlayer) => {

                ambientPlayer = new AudioPlayerWrapper(state.audioCtx, audioPlayer, {
                    destination: state.premaster,
                    loop: true
                });

                // should be safe to resume and take the init time here (after user gesture)
                state.audioCtx.resume();
                ambientPlayer.start();

            });

        }

        return () => {
            state.scheduler.clear();
            state.audioCtx.suspend();
            flags.playAmbientTrack && ambientPlayer.stop();
        };

    }, [bpm, id, flags.playAmbientTrack, ambientTrack, ambientTrackLength, timeSignature, state.scheduler, state.audioCtx, state.premaster, state.sampleRate]);

    /* Background Mode Hook */
    React.useEffect(() => {
        // init event
        if (state.backgroundMode && !state.scheduler.repeatingQueue.find((e) => e.id === backgroundModeEventRef.current)) {
            backgroundModeEventRef.current = state.scheduler.scheduleRepeating(
                state.audioCtx.currentTime + (60 / bpm),
                32 * 60 / bpm,
                triggerRandomVoice
            )
            // update event
        } else if (state.backgroundMode) {
            state.scheduler.updateCallback(backgroundModeEventRef.current, triggerRandomVoice);
            // stop event
        } else if (!state.backgroundMode) {
            state.scheduler.cancel(backgroundModeEventRef.current);
        }

    }, [bpm, state.backgroundMode, triggerRandomVoice, state.audioCtx, state.scheduler]);

    /* Mute Hook */
    React.useEffect(() => {

        const startMute = () => {
            state.premaster.gain.value = 0;
        }

        const stopMute = () => {
            state.premaster.gain.value = 1;
        }

        if (state.mute) {
            startMute();
        } else {
            stopMute();
        }

    }, [state.mute, state.premaster]);

    return (

        <MusicPlayerContext.Provider value={{
            ...state,
            dispatch
        }}>

            <FreqBands />

            <MenuButtonParent
                name='Menu'
                direction='right'
                separation='6rem'
                parentSize='5rem'
                childButtonProps={[{
                    id: 'home',
                    iconName: 'icon-home',
                    content:
                        React.useMemo(() => <HomePanel />, [])
                }, {
                    autoOpen: true,
                    id: 'toggles',
                    iconName: 'icon-music',
                    content:
                        React.useMemo(() => <ToggleButtonPanel
                            handleRandomize={handleRandomize}
                            handleReset={handleReset}
                            players={state.players}
                        />, [handleRandomize, handleReset, state.players])
                }, {
                    id: 'effects',
                    iconName: 'icon-equalizer',
                    content: React.useMemo(() => <EffectsPanel
                        impulseResponse={state.impulseResponse}
                        dispatch={dispatch}
                    />, [state.impulseResponse, dispatch])
                }, {
                    id: 'song-info',
                    iconName: 'icon-info',
                    content:
                        React.useMemo(() => <SongInfoPanel
                        />, [])
                }]}
            />

            <CanvasViz />

        </MusicPlayerContext.Provider>
    );

}
