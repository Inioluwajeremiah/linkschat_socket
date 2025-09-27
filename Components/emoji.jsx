import React from 'react';
import { View } from 'react-native';
import EmojiSelector from 'react-native-emoji-selector';

const EmojiSelectorComponent = () => {
  return (
    <View>
      <EmojiSelector
        onEmojiSelected={(emoji) => console.log('Selected:', emoji)}
        theme="007AFF"
        showTabs={true}
        showSearchBar={true}
        columns={6}
      />
    </View>
  );
};

export default EmojiSelectorComponent;