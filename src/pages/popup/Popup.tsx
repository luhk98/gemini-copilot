import React, { useEffect, useState, useCallback } from 'react';
import browser from 'webextension-polyfill';

import { DarkModeToggle } from '../../components/DarkModeToggle';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { useLanguage } from '../../contexts/LanguageContext';


import { CloudSyncSettings } from './components/CloudSyncSettings';
import { KeyboardShortcutSettings } from './components/KeyboardShortcutSettings';



import { isSafari } from '@/core/utils/browser';

type ScrollMode = 'jump' | 'flow';





interface SettingsUpdate {
  mode?: ScrollMode | null;
  hideContainer?: boolean;
  draggableTimeline?: boolean;
  resetPosition?: boolean;
  folderEnabled?: boolean;
  hideArchivedConversations?: boolean;
  watermarkRemoverEnabled?: boolean;
}

export default function Popup() {
  const { t } = useLanguage();
  const [folderEnabled, setFolderEnabled] = useState<boolean>(true);
  const [hideArchivedConversations, setHideArchivedConversations] = useState<boolean>(false);

  const [watermarkRemoverEnabled, setWatermarkRemoverEnabled] = useState<boolean>(true);


  // Helper function to apply settings to storage
  const apply = useCallback((settings: SettingsUpdate) => {
    const payload: any = {};
    if (typeof settings.folderEnabled === 'boolean') payload.geminiFolderEnabled = settings.folderEnabled;
    if (typeof settings.hideArchivedConversations === 'boolean') payload.geminiFolderHideArchivedConversations = settings.hideArchivedConversations;
    if (typeof settings.watermarkRemoverEnabled === 'boolean') payload.geminiWatermarkRemoverEnabled = settings.watermarkRemoverEnabled;
    try {
      chrome.storage?.sync?.set(payload);
    } catch { }
  }, []);





  useEffect(() => {
    try {
      chrome.storage?.sync?.get(
        {
          geminiTimelineScrollMode: 'flow',
          geminiTimelineHideContainer: false,
          geminiTimelineDraggable: false,
          geminiFolderEnabled: true,
          geminiFolderHideArchivedConversations: false,
          geminiWatermarkRemoverEnabled: true,
        },
        (res) => {
          setFolderEnabled(res?.geminiFolderEnabled !== false);
          setHideArchivedConversations(!!res?.geminiFolderHideArchivedConversations);
          setWatermarkRemoverEnabled(res?.geminiWatermarkRemoverEnabled !== false);
        }
      );
    } catch { }
  }, []);





  return (
    <div className="w-[360px] bg-background text-foreground">
      {/* Header */}
      <div className="bg-linear-to-br from-primary/10 via-accent/5 to-transparent border-b border-border/50 px-5 py-4 flex items-center justify-between backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {t('extName')}
        </h1>
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Gemini Only Notice */}
        <Card className="p-3 bg-primary/10 border-primary/20 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary shrink-0"
            >
              <path
                d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4H7V5h2v3z"
                fill="currentColor"
              />
            </svg>
            <p className="text-xs text-primary font-medium">{t('geminiOnlyNotice')}</p>
          </div>
        </Card>
        {/* Folder Options */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardTitle className="mb-4 text-xs uppercase">{t('folderOptions')}</CardTitle>
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between group">
              <Label htmlFor="folder-enabled" className="cursor-pointer text-sm font-medium group-hover:text-primary transition-colors">
                {t('enableFolderFeature')}
              </Label>
              <Switch
                id="folder-enabled"
                checked={folderEnabled}
                onChange={(e) => {
                  setFolderEnabled(e.target.checked);
                  apply({ folderEnabled: e.target.checked });
                }}
              />
            </div>
            <div className="flex items-center justify-between group">
              <Label htmlFor="hide-archived" className="cursor-pointer text-sm font-medium group-hover:text-primary transition-colors">
                {t('hideArchivedConversations')}
              </Label>
              <Switch
                id="hide-archived"
                checked={hideArchivedConversations}
                onChange={(e) => {
                  setHideArchivedConversations(e.target.checked);
                  apply({ hideArchivedConversations: e.target.checked });
                }}
              />
            </div>
          </CardContent>
        </Card>
        {/* Cloud Sync - Hidden on Safari due to API limitations */}
        {!isSafari() && <CloudSyncSettings />}
        {/* Chat Width */}




        {/* Keyboard Shortcuts */}
        <KeyboardShortcutSettings />



        {/* NanoBanana Options */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <CardTitle className="mb-4 text-xs uppercase">{t('nanobananaOptions')}</CardTitle>
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between group">
              <div className="flex-1">
                <Label htmlFor="watermark-remover" className="cursor-pointer text-sm font-medium group-hover:text-primary transition-colors">
                  {t('enableNanobananaWatermarkRemover')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">{t('nanobananaWatermarkRemoverHint')}</p>
              </div>
              <Switch
                id="watermark-remover"
                checked={watermarkRemoverEnabled}
                onChange={(e) => {
                  setWatermarkRemoverEnabled(e.target.checked);
                  apply({ watermarkRemoverEnabled: e.target.checked });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-linear-to-br from-secondary/30 via-accent/10 to-transparent border-t border-border/50 px-5 py-4 flex items-center justify-center backdrop-blur-sm">
        <a
          href="https://github.com/Nagi-ovo/gemini-voyager"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          title={t('starProject')}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>{t('starProject')}</span>
        </a>
      </div>
    </div>
  );
}