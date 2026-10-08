import React from 'react';
import {Modal, type ModalProps, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

type ScreenModalProps = Omit<ModalProps, 'transparent' | 'presentationStyle'> & {
  backgroundColor: string;
};

// Native modals have their own view hierarchy. Measure safe areas inside that
// hierarchy so headers stay below the status bar and clear landscape cutouts.
export function ScreenModal({children, backgroundColor, testID, ...props}: ScreenModalProps) {
  return <Modal presentationStyle="fullScreen" supportedOrientations={['portrait','portrait-upside-down','landscape-left','landscape-right']} {...props}>
    <SafeAreaProvider style={[styles.fill,{backgroundColor}]}>
      <SafeAreaView testID={testID ? `${testID}-safe-area` : undefined} edges={['top','right','bottom','left']} style={styles.fill}>
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}

const styles = StyleSheet.create({fill:{flex:1}});
