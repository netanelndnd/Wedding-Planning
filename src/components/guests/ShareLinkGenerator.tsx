'use client';

/**
 * ShareLinkGenerator Component
 *
 * Generates and displays the shareable guest registration link.
 * Includes copy to clipboard and WhatsApp share functionality.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/**
 * ShareLinkGenerator component props
 */
export interface ShareLinkGeneratorProps {
  /** Couple ID for generating the invite link */
  coupleId: string;
  /** Partner names for personalized message */
  partnerNames?: {
    partner1: string;
    partner2: string;
  };
  /** Wedding date for personalized message */
  weddingDate?: Date;
}

/**
 * Share link generator component with copy and WhatsApp share
 *
 * @example
 * ```tsx
 * <ShareLinkGenerator
 *   coupleId={coupleId}
 *   partnerNames={{ partner1: 'דני', partner2: 'מיכל' }}
 *   weddingDate={new Date('2026-06-15')}
 * />
 * ```
 */
export function ShareLinkGenerator({
  coupleId,
  partnerNames,
  weddingDate,
}: ShareLinkGeneratorProps): React.ReactElement {
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate the invite link on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/invite/${coupleId}`);
    }
  }, [coupleId]);

  // Format wedding date for display
  const formattedDate = weddingDate
    ? weddingDate.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Generate personalized message
  const generateMessage = (): string => {
    let message = 'הוזמנתם לחתונה שלנו!';

    if (partnerNames) {
      message = `הוזמנתם לחתונה של ${partnerNames.partner1} ו${partnerNames.partner2}!`;
    }

    if (formattedDate) {
      message += ` בתאריך ${formattedDate}`;
    }

    message += `\n\nנא אשרו הגעה דרך הקישור:\n${inviteLink}`;

    return message;
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(generateMessage());
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            קישור הרשמת אורחים
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            שתפו את הקישור הזה עם האורחים כדי שיוכלו לאשר הגעה בעצמם
          </p>
        </div>

        {/* Link Display */}
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 bg-transparent border-none text-sm text-gray-700 focus:outline-none"
            dir="ltr"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? 'הועתק!' : 'העתק'}
          </Button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={handleWhatsAppShare}
            className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            <svg
              className="w-5 h-5 me-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            שתף בוואטסאפ
          </Button>

          <Button
            variant="secondary"
            onClick={handleCopyLink}
            className="flex-1"
          >
            <svg
              className="w-5 h-5 me-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            העתק קישור
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">איך זה עובד?</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>שתפו את הקישור עם האורחים</li>
            <li>האורחים ממלאים את פרטיהם ואישור הגעה</li>
            <li>הנתונים מתעדכנים אוטומטית ברשימה שלכם</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}

ShareLinkGenerator.displayName = 'ShareLinkGenerator';
