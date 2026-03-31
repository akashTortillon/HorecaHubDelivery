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
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';

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
  maxListHeight = 300, // Increased default height for better scrolling
  dropDownStyles,
  disabled = false,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const currentLabel = options.find(o => o.id === value)?.name || placeholder;

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openDropdown = () => {
    setSearchQuery(''); // Reset search when opening
    inputRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      // Determine if we should open upwards or downwards based on available space
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
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
          },
          dropDownStyles,
        ]}
        onPress={() => !disabled && openDropdown()}
        activeOpacity={0.7}>
        {leftIcon && (
          <Icon xml={leftIcon} size={15} color={'#64748b'} />
        )}
        <Text 
          style={[styles.valueText, {color: value ? '#1e293b' : '#94a3b8'}]} 
          numberOfLines={1}
        >
          {currentLabel}
        </Text>
        <Icon
          xml={rightIcon || SVG_ICONS.arrowDown}
          size={12}
          color={'#64748b'}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdownListContainer,
              {
                left: dropdownLayout?.x,
                width: dropdownLayout?.width,
                maxHeight: maxListHeight,
                top: direction === 'down'
                    ? (dropdownLayout?.y || 0) + (dropdownLayout?.height || 0) + 5
                    : undefined,
                bottom: direction === 'up'
                    ? SCREEN_HEIGHT - (dropdownLayout?.y || 0) + 5
                    : undefined,
              },
            ]}>
            
            {/* Search Input for long lists */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <ScrollView 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              style={{ flexGrow: 0 }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.optionItem,
                      item.id === value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}>
                    <Text style={[
                      styles.optionText, 
                      {color: item.id === value ? '#2563eb' : '#1e293b'}
                    ]}>
                      {item.name}
                    </Text>
                    {item.id === value && (
                      <Icon xml={SVG_ICONS.tickIcon} size={14} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResult}>
                  <Text style={styles.noResultText}>No results found</Text>
                </View>
              )}
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
    paddingHorizontal: 16,
    height: 55, 
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 10,
  },
  valueText: {flex: 1, fontSize: 15, fontWeight: '600'},
  overlay: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)'},
  dropdownListContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {fontSize: 14, fontWeight: '500'},
  noResult: {padding: 20, alignItems: 'center'},
  noResultText: {color: '#94a3b8', fontSize: 13},
});

export default Dropdown;