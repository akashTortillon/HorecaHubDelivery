import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Dropdown, {DropdownOption} from '../components/DropDownComponent';
import Icon from '../utilities/Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useToast} from '../utilities/ToastContext';
import { reportOrderIssue } from '../api/home/homeApi';

// Updated to match API expected reason slugs
const REPORT_OPTIONS: DropdownOption[] = [
  {id: 'customer_not_available', name: 'Customer Not Available'},
  {id: 'reschedule_delivery', name: 'Reschedule Delivery'},
  {id: 'package_damaged', name: 'Package Damaged'},
  {id: 'wrong_address', name: 'Wrong Address'},
  {id: 'customer_refused', name: 'Customer Refused'},
  {id: 'other', name: 'Other'},
];

const ReportIssueScreen = ({route, navigation}: any) => {
  const {showToast} = useToast();
  const orderId = route?.params?.orderId;
  const orderNumber = route?.params?.orderNumber || 'Order Report';

  const [reason, setReason] = useState<string | undefined>(undefined);
  const [remarks, setRemarks] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }

    try {
      setLoading(true);
      await reportOrderIssue(orderId, reason, remarks, imageUri);

      showToast('Issue reported successfully', 'success');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message || 'Could not submit report. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerLabel}>Report Issue for:</Text>
        <Text style={styles.orderIdText}>{orderNumber}</Text>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Select Reason:</Text>
          <Dropdown
            placeholder="-- Choose a reason --"
            options={REPORT_OPTIONS}
            value={reason}
            onChange={item => setReason(item.id)}
            dropDownStyles={styles.dropdownOverride}
          />

          <TextInput
            style={styles.textArea}
            placeholder="Add remarks (e.g. damaged, door locked)..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={remarks}
            onChangeText={setRemarks}
            textAlignVertical="top"
          />

          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{uri: imageUri}} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImageUri(undefined)}>
                <Icon xml={SVG_ICONS.closeIcon} size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            activeOpacity={0.7}
            onPress={handlePickImage}>
            <View style={styles.row}>
              <Icon
                xml={SVG_ICONS.cameraIcon || SVG_ICONS.boxOutline}
                size={20}
                color="#475569"
              />
              <Text style={styles.uploadText}>
                {' '}
                {imageUri ? 'Change Photo' : 'Upload Photo (Optional)'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!reason || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!reason || loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonRow}>
              <Icon xml={SVG_ICONS.warningIcon} color="white" />
              <Text style={styles.submitButtonText}> Submit Issue Report</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  content: {padding: 20},
  headerLabel: {fontSize: 18, fontWeight: '700', color: '#1E293B'},
  orderIdText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  dropdownOverride: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 16,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  uploadText: {color: '#475569', fontWeight: '600'},
  submitButton: {
    backgroundColor: '#E11D48',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
  },
  submitButtonDisabled: {backgroundColor: '#FDA4AF'},
  buttonRow: {flexDirection: 'row', alignItems: 'center'},
  submitButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '700'},
  row: {flexDirection: 'row', alignItems: 'center'},
});

export default ReportIssueScreen;
