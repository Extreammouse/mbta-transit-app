import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

class ElevenLabsService {
    private apiKey = 'sk_9db596a83ecc8d9bab3e090f80d2f2a009ee6301499bd521'.trim(); // Updated and Trimmed Key
    private voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel Voice
    private soundObject: Audio.Sound | null = null;
    private cacheFileName = 'support_message_v1.mp3';

    async playSupportMessage(): Promise<void> {
        const text = "Hello, thank you for calling M.B.T.A customer support. All our agents are currently busy assisting other passengers. Please check our website or app for the latest service alerts. Goodbye.";
        await this.speak(text, this.cacheFileName);
    }

    async speak(text: string, cacheFileName: string = 'last_tts.mp3'): Promise<void> {
        try {
            await this.stopAudio(); // Stop any currently playing audio

            // Check for internet if we need to fetch
            const netState = await NetInfo.fetch();
            const isConnected = netState.isConnected && netState.isInternetReachable !== false;

            const fileUri = `${FileSystem.cacheDirectory}${cacheFileName}`;
            let fileExists = false;

            try {
                // Using legacy API which supports readAsStringAsync and caches files properly
                await FileSystem.readAsStringAsync(fileUri);
                fileExists = true;
            } catch (e) {
                fileExists = false;
            }

            if (!fileExists) {
                if (!isConnected) {
                    console.log('Offline and no cached audio.');
                    return;
                }

                console.log('Fetching audio from ElevenLabs...');
                const response = await axios.post(
                    `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
                    {
                        text: text,
                        model_id: "eleven_turbo_v2",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    },
                    {
                        headers: {
                            'xi-api-key': this.apiKey, // Ensure key is sent
                            'Content-Type': 'application/json',
                            'Accept': 'audio/mpeg'
                        },
                        responseType: 'arraybuffer'
                    }
                );

                const base64Data = Buffer.from(response.data, 'binary').toString('base64');
                await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log('Audio saved to cache:', fileUri);
            } else {
                console.log('Using cached audio:', fileUri);
            }

            // Play the audio
            console.log('Loading sound...');
            const { sound } = await Audio.Sound.createAsync(
                { uri: fileUri },
                { shouldPlay: true }
            );

            this.soundObject = sound;

            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await sound.unloadAsync();
                    this.soundObject = null;
                }
            });

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('ElevenLabs Axios Error:', {
                    status: error.response?.status,
                    data: error.response?.data ? Buffer.from(error.response.data as any).toString() : 'No data',
                    message: error.message
                });
            } else {
                console.error('ElevenLabs Service Error:', error);
            }
        }
    }

    async stopAudio(): Promise<void> {
        if (this.soundObject) {
            try {
                await this.soundObject.stopAsync();
                await this.soundObject.unloadAsync();
            } catch (e) {
                // Ignore errors on cleanup
            }
            this.soundObject = null;
        }
    }
}

export const elevenLabsService = new ElevenLabsService();
