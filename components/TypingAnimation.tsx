import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  onAnimationEnd?: () => void;
  typingSpeed?: number; // Milliseconds per character
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ text, onAnimationEnd, typingSpeed = 30 }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [typingIndex, setTypingIndex] = useState<number>(0);

  useEffect(() => {
    if (text && typingIndex < text.length) {
      // If the incoming text has grown beyond what's displayed, and we haven't finished typing it,
      // continue typing from the last displayed character.
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, typingIndex + 1));
        setTypingIndex((prevIndex) => prevIndex + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else if (text && typingIndex >= text.length && displayedText !== text) {
      // If the text is fully received and displayedText is not yet equal to text,
      // it means we finished typing or the text updated to be shorter than current index.
      // Set the displayed text immediately.
      setDisplayedText(text);
      setTypingIndex(text.length); // Ensure index matches length
      onAnimationEnd?.();
    } else if (!text && displayedText !== '') {
      // Clear displayed text if the source text becomes empty
      setDisplayedText('');
      setTypingIndex(0);
    }
  }, [text, typingIndex, typingSpeed, displayedText, onAnimationEnd]);

  // Handle cases where the text prop might change significantly (e.g., reset)
  useEffect(() => {
    // If the text prop changes and is shorter than current displayed text length,
    // or if it's completely new, reset the typing animation
    if (text.length < displayedText.length || (text.length > 0 && !displayedText.startsWith(text.substring(0, displayedText.length)))) {
      setDisplayedText('');
      setTypingIndex(0);
    } else if (text.length > displayedText.length) {
      // If new text is longer, but starts with the already displayed text,
      // update the displayed text immediately to the common prefix and continue typing from there.
      setDisplayedText(text.substring(0, displayedText.length)); // Ensure displayedText doesn't get ahead of typingIndex if the text updates fast
    }
  }, [text]);

  return <>{displayedText}</>;
};

export default TypingAnimation;