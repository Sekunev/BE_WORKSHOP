'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Sun, Moon, Sparkles } from 'lucide-react';

const themes = [
  { id: 'light', name: 'Açık', icon: Sun },
  { id: 'dark', name: 'Koyu', icon: Moon },
  { id: 'blue', name: 'Mavi', icon: Palette },
  { id: 'green', name: 'Yeşil', icon: Sparkles },
  { id: 'purple', name: 'Mor', icon: Palette },
  { id: 'red', name: 'Kırmızı', icon: Palette },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          {currentTheme && <currentTheme.icon className="h-4 w-4" />}
          <span className="sr-only">Tema değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className="flex items-center space-x-2"
          >
            <themeOption.icon className="h-4 w-4" />
            <span>{themeOption.name}</span>
            {theme === themeOption.id && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
