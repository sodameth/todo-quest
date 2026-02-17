import { useState, useCallback } from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';

export function useAchievements() {
  const [unlockedAch, setUnlockedAch] = useState([]);
  const [achToast, setAchToast] = useState(null);

  const checkAch = useCallback((stats) => {
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAch.includes(a.id) && a.check(stats)) {
        setUnlockedAch(p => [...p, a.id]);
        setAchToast(a);
      }
    });
  }, [unlockedAch]);

  return { unlockedAch, achToast, setAchToast, checkAch };
}
