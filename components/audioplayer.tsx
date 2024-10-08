import React, { useState, useEffect } from "react";
import { View, Button, Text, TouchableOpacity } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPause, faPlay, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

interface AudioPlayerProps {
  audioUri: string;
  title: string;
  size: number;
  mode?: "regular" | "short"; // Optional mode prop, default to 'regular'
}

const AudioPlayer = ({
  audioUri,
  title,
  size,
  mode = "regular",
}: AudioPlayerProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Function to load and play audio
  const playAudio = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
     // newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

      setSound(newSound);
      setIsPlaying(true);
    } else {
      // If sound is already loaded, check if it's playing or paused
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };



  // Cleanup function to unload sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View className="flex flex-row gap-2">
      <Text className="text-xl font-semibold text-blue-700">{title}</Text>
      <TouchableOpacity onPress={playAudio}>
        <FontAwesomeIcon
          icon={mode === "short" ? faVolumeHigh : isPlaying ? faPause : faPlay}
          size={size}
          color={"blue"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default AudioPlayer;
