import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '../constants';
import { ethers, BrowserProvider } from 'ethers';
import { UserPlus, CheckCircle, Users, Award, Upload, X, Share2, Check } from 'lucide-react';

const TIP_MYST_ABI = [
  "function registerCreator(string memory _name, string memory _bio, string memory _category, string memory _imageUrl) external",
  "function isCreator(address creator) external view returns (bool)",
  "function getCreator(address creator) external view returns (tuple(string name, string bio, string category, string imageUrl, address wallet, uint256 supporterCount, bool exists))"
];

export default function RegisterCreatorCard() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { address } = useAccount();

  // Default placeholder image - auto-generated avatar
  const DEFAULT_IMAGE = `https://api.dicebear.com/7.x/avataaars/svg?seed=${address || 'default'}`;
  
  useEffect(() => {
    checkIfRegistered();
  }, [address]);

  const copyShareableLink = async () => {
    if (!address) return;
    const link = `${window.location.origin}${window.location.pathname}?creator=${address}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tipmyst_uploads');
      
      const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dztd1tlbl/image/upload';
      
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      return DEFAULT_IMAGE;
    }
  };

  const checkIfRegistered = async () => {
    if (!address) return;

    try {
      setChecking(true);
      const provider = new BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, provider);

      const registered = await contract.isCreator(address);
      setIsRegistered(registered);

      if (registered) {
        const creator = await contract.getCreator(address);
        setCreatorInfo({
          name: creator[0],
          bio: creator[1],
          category: creator[2],
          imageUrl: creator[3],
          supporterCount: creator[5].toString()
        });
      }
    } catch (error) {
      console.error('Check registration failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!address || !name) return;

    try {
      setLoading(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.TIP_JAR, TIP_MYST_ABI, signer);

      // Upload image if file is selected
      let finalImageUrl = imageUrl;
      
      if (imageFile) {
        console.log('📤 Uploading image to server...');
        finalImageUrl = await uploadToIPFS(imageFile);
      } else if (!imageUrl) {
        // Use default placeholder image
        finalImageUrl = DEFAULT_IMAGE;
      }

      console.log('🖼️ Using image URL:', finalImageUrl);

      const tx = await contract.registerCreator(
        name,
        bio || 'No bio provided',
        category || 'General',
        finalImageUrl
      );

      await tx.wait();

      alert('🎉 Successfully registered as a creator!');
      await checkIfRegistered();

      setName('');
      setBio('');
      setCategory('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="premium-card h-full">
        <div className="text-center py-12">
          <div className="gold-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Checking registration...</p>
        </div>
      </div>
    );
  }

  if (isRegistered && creatorInfo) {
    return (
      <div className="premium-card h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6BA292]/20 to-[#6BA292]/5 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#6BA292]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">You're a Creator!</h2>
            <p className="text-xs text-gray-500">Registered successfully</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Creator Profile Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#6BA292]/10 to-transparent border border-[#6BA292]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6BA292]/5 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <img 
                src={creatorInfo.imageUrl} 
                alt={creatorInfo.name}
                className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover ring-2 ring-[#6BA292]/30"
              />
              <h3 className="text-2xl font-bold text-white mb-2">{creatorInfo.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{creatorInfo.bio}</p>
              
              <div className="flex justify-center gap-2">
                <span className="gold-badge">
                  <Award className="w-3 h-3" />
                  {creatorInfo.category}
                </span>
                <span className="blue-badge">
                  <Users className="w-3 h-3" />
                  {creatorInfo.supporterCount} supporters
                </span>
              </div>
            </div>
          </div>

          {/* Share Link Button */}
          <button
            onClick={copyShareableLink}
            className="w-full gold-button flex items-center justify-center gap-2"
          >
            {linkCopied ? (
              <>
                <Check className="w-5 h-5" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Copy Shareable Link
              </>
            )}
          </button>

          {/* Address Info */}
          <div className="alert-success flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Your Creator Address</p>
              <p className="font-mono text-xs break-all opacity-80">{address}</p>
              <p className="text-xs mt-2 opacity-80">
                Share your link on social media so people can send you confidential tips!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FED10A]/20 to-[#FED10A]/5 flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-[#FED10A]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Register as Creator</h2>
          <p className="text-xs text-gray-500">Start receiving tips</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name <span className="text-[#FED10A]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your creator name"
            className="premium-input"
          />
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture
          </label>
          
          {imagePreview ? (
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full rounded-2xl object-cover ring-2 ring-[#FED10A]/30"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#FED10A]/20 rounded-xl hover:border-[#FED10A]/40 transition-colors cursor-pointer bg-[#FED10A]/5 hover:bg-[#FED10A]/10"
              >
                <Upload className="w-8 h-8 text-[#FED10A] mb-2" />
                <span className="text-sm text-gray-400">Click to upload image</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
              </label>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            {imagePreview ? 'Image selected' : 'Or leave blank for auto-generated avatar'}
          </p>
        </div>

        {/* Image URL (Alternative) */}
        {!imagePreview && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or paste image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="premium-input"
            />
          </div>
        )}

        {/* Bio Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            rows={3}
            className="premium-input resize-none"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="premium-input cursor-pointer"
          >
            <option value="">Select category...</option>
            <option value="Art">🎨 Art</option>
            <option value="Music">🎵 Music</option>
            <option value="Writing">✍️ Writing</option>
            <option value="Gaming">🎮 Gaming</option>
            <option value="Tech">💻 Tech</option>
            <option value="Education">📚 Education</option>
            <option value="Other">🌟 Other</option>
          </select>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={!name || loading}
          className="w-full gold-button disabled:opacity-40"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto"></div>
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5 inline mr-2" />
              Register as Creator
            </>
          )}
        </button>

        {/* Warning */}
        <div className="alert-warning flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="text-sm">
            <p className="font-semibold mb-1">Important</p>
            <p className="opacity-80">
              Once registered, you cannot change your creator info on-chain. Choose carefully!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}