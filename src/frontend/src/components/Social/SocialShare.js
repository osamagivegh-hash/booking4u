import React, { useState } from 'react';
import { 
  ShareIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

const SocialShare = ({ 
  url, 
  title, 
  description, 
  image,
  size = 'md',
  showLabel = true,
  platforms = ['whatsapp', 'twitter', 'facebook', 'linkedin', 'telegram', 'copy']
}) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const socialPlatforms = {
    whatsapp: {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: (url, title, description) => {
        const text = `${title}\n\n${description}\n\n${url}`;
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
      }
    },
    twitter: {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400 hover:bg-blue-500',
      url: (url, title, description) => {
        const text = `${title}\n\n${description}`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      }
    },
    facebook: {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: (url, title, description) => {
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
      }
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: (url, title, description) => {
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
      }
    },
    telegram: {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: (url, title, description) => {
        const text = `${title}\n\n${description}\n\n${url}`;
        return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      }
    },
    instagram: {
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: (url, title, description) => {
        // Instagram doesn't support direct sharing, so we'll copy the content
        return null;
      }
    },
    copy: {
      name: 'Copy Link',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      url: null
    }
  };

  const handleShare = async (platform) => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success(t('linkCopied') || 'تم نسخ الرابط');
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error(t('copyFailed') || 'فشل في نسخ الرابط');
      }
      return;
    }

    const platformData = socialPlatforms[platform];
    if (!platformData) return;

    if (platform === 'instagram') {
      // For Instagram, copy the content to clipboard
      const content = `${title}\n\n${description}\n\n${url}`;
      try {
        await navigator.clipboard.writeText(content);
        toast.success(t('contentCopied') || 'تم نسخ المحتوى للإنستغرام');
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error(t('copyFailed') || 'فشل في نسخ المحتوى');
      }
      return;
    }

    const shareUrl = platformData.url(url, title, description);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        setIsOpen(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error(t('shareFailed') || 'فشل في المشاركة');
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`flex items-center space-x-2 space-x-reverse ${sizeClasses[size]} text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors`}
      >
        <ShareIcon className={iconSizes[size]} />
        {showLabel && (
          <span className="font-medium">{t('share')}</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('share')}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Share Content Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                <p className="text-xs text-gray-400 mt-2 truncate">{url}</p>
              </div>

              {/* Share Platforms */}
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => {
                  const platformData = socialPlatforms[platform];
                  if (!platformData) return null;

                  return (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className={`flex items-center justify-center space-x-2 space-x-reverse p-3 rounded-lg text-white transition-colors ${platformData.color}`}
                    >
                      {platform === 'copy' && copied ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-lg">{platformData.icon}</span>
                      )}
                      <span className="font-medium text-sm">
                        {platform === 'copy' && copied ? t('copied') || 'تم النسخ' : platformData.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Additional Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('shareVia') || 'مشاركة عبر'}</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        const emailSubject = title;
                        const emailBody = `${description}\n\n${url}`;
                        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
                        setIsOpen(false);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      📧 {t('email') || 'البريد الإلكتروني'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => {
                        const smsText = `${title}\n\n${description}\n\n${url}`;
                        window.open(`sms:?body=${encodeURIComponent(smsText)}`);
                        setIsOpen(false);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      📱 {t('sms') || 'الرسائل النصية'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialShare;




