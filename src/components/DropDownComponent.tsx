import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from '../utilities/Icon';
import { SVG_ICONS } from '../assets/icons/svg';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export type DropdownOption = {
  name: string;
  id: any;
};

type Props = {
  placeholder?: string;
  options: DropdownOption[];
  value: string | undefined;
  onChange: (value: DropdownOption) => void;
  leftIcon?: string;
  rightIcon?: string;
  maxListHeight?: number;
  dropDownStyles?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const Dropdown = ({
  placeholder = 'Select...',
  options,
  value,
  onChange,
  leftIcon,
  rightIcon,
  maxListHeight = 200,
  dropDownStyles,
  disabled = false,
}: Props) => {
//   const {colors} = useTheme();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const currentLabel = options.find(o => o.id === value)?.name || placeholder;

  const openDropdown = () => {
    inputRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      setDirection(spaceBelow >= maxListHeight ? 'down' : 'up');
      setDropdownLayout({x, y, width, height});
      setOpen(true);
    });
  };

  return (
    <>
      <TouchableOpacity
        ref={inputRef}
        style={[
          styles.dropdownBox,
          {
            backgroundColor: '#eeeeee',
            borderColor: '#cdd4e0',
          },
          dropDownStyles,
        ]}
        onPress={() => !disabled && openDropdown()}
        activeOpacity={0.7}>
        {leftIcon && (
          <Icon xml={SVG_ICONS.arrowDown} size={15} color={'#000000'} />
        )}
        <Text style={[styles.valueText, {color: '#000000'}]} numberOfLines={1}>
          {currentLabel}
        </Text>
        <Icon
          xml={rightIcon || SVG_ICONS.arrowDown}
          size={10}
          color={'#000000'}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              left: dropdownLayout?.x,
              top:
                direction === 'down'
                  ? (dropdownLayout?.y || 0) + (dropdownLayout?.height || 0) + 5
                  : undefined,
              bottom:
                direction === 'up'
                  ? SCREEN_HEIGHT - (dropdownLayout?.y || 0) + 5
                  : undefined,
              width: dropdownLayout?.width,
              backgroundColor: '#eeeeee',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#eeeeee',
              elevation: 5,
              maxHeight: maxListHeight,
            }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.optionItem,
                    {borderBottomColor: '#cdd4e0'},
                    item.id === value && {
                      backgroundColor: '#eeeeee',
                    },
                  ]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}>
                  <Text style={[styles.optionText, {color: '#000000'}]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48, // Fixed Height
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  valueText: {flex: 1, fontSize: 14, fontWeight: '500'},
  overlay: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)'},
  optionItem: {padding: 15, borderBottomWidth: 1},
  optionText: {fontSize: 14},
});

export default Dropdown;
