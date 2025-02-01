import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SessionPromptProps {
  onChoice: (useSaved: boolean) => void;
}

const SessionPrompt: React.FC<SessionPromptProps> = ({ onChoice }) => {
  const [open, setOpen] = useState(false);
  const [_savedStyle, setSavedStyle] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mapStyle');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedStyle(parsed);
        setOpen(true);
      } catch (error) {
        console.error('Error parsing saved style:', error);
        localStorage.removeItem('mapStyle');
      }
    }
  }, []);

  const handleContinue = () => {
    setOpen(false);
    onChoice(true);
  };

  const handleReset = () => {
    setOpen(false);
    localStorage.removeItem('mapStyle');
    onChoice(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Continue Previous Session?</DialogTitle>
          <DialogDescription>
            We found saved style settings from your last visit. Would you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Start Fresh
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionPrompt;