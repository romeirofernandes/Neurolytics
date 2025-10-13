import React from 'react';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import ParticipantSidebar from '../../components/participant/ParticipantSidebar';
import { useParticipant } from '../../context/ParticipantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  Award, 
  Trophy, 
  Star, 
  Lock, 
  CheckCircle2,
  Target,
  Zap,
  Crown,
  Flame,
  Gift,
  TrendingUp
} from 'lucide-react';

const Achievements = () => {
  const { participant } = useParticipant();
  
  // Hardcoded data for a one-day old account
  const currentLevel = 1;
  const currentXP = 15;
  const xpToNextLevel = 100;
  const participatedCount = participant?.experimentsParticipated?.length || 0;
  
  // Level definitions
  const levels = [
    { level: 1, name: 'Novice', minXP: 0, maxXP: 100, icon: Star, color: 'text-gray-500' },
    { level: 2, name: 'Apprentice', minXP: 100, maxXP: 250, icon: Target, color: 'text-blue-500' },
    { level: 3, name: 'Researcher', minXP: 250, maxXP: 500, icon: Zap, color: 'text-purple-500' },
    { level: 4, name: 'Scholar', minXP: 500, maxXP: 1000, icon: Trophy, color: 'text-yellow-500' },
    { level: 5, name: 'Expert', minXP: 1000, maxXP: 2000, icon: Crown, color: 'text-orange-500' },
    { level: 6, name: 'Master', minXP: 2000, maxXP: Infinity, icon: Flame, color: 'text-red-500' },
  ];

  // Achievement definitions
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Create your participant account',
      icon: Star,
      unlocked: true,
      xp: 10,
      rarity: 'common',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    {
      id: 2,
      title: 'Early Bird',
      description: 'Join within the first day',
      icon: Gift,
      unlocked: true,
      xp: 5,
      rarity: 'common',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    },
    {
      id: 3,
      title: 'First Contribution',
      description: 'Complete your first experiment',
      icon: CheckCircle2,
      unlocked: participatedCount >= 1,
      xp: 20,
      rarity: 'common',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 4,
      title: 'Dedicated Researcher',
      description: 'Complete 5 experiments',
      icon: Target,
      unlocked: false,
      xp: 50,
      rarity: 'rare',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
    {
      id: 5,
      title: 'Science Enthusiast',
      description: 'Complete 10 experiments',
      icon: Trophy,
      unlocked: false,
      xp: 100,
      rarity: 'rare',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 6,
      title: 'Week Warrior',
      description: 'Participate for 7 consecutive days',
      icon: Flame,
      unlocked: false,
      xp: 75,
      rarity: 'rare',
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    {
      id: 7,
      title: 'Data Champion',
      description: 'Complete 25 experiments',
      icon: Crown,
      unlocked: false,
      xp: 250,
      rarity: 'epic',
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
    },
    {
      id: 8,
      title: 'Research Legend',
      description: 'Complete 50 experiments',
      icon: Award,
      unlocked: false,
      xp: 500,
      rarity: 'legendary',
      color: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    {
      id: 9,
      title: 'Speed Demon',
      description: 'Complete an experiment in under 5 minutes',
      icon: Zap,
      unlocked: false,
      xp: 30,
      rarity: 'rare',
      color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 10,
      title: 'Perfect Score',
      description: 'Achieve 100% accuracy in an experiment',
      icon: Star,
      unlocked: false,
      xp: 100,
      rarity: 'epic',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 11,
      title: 'Night Owl',
      description: 'Complete an experiment after midnight',
      icon: Target,
      unlocked: false,
      xp: 25,
      rarity: 'common',
      color: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
    },
    {
      id: 12,
      title: 'Master of Science',
      description: 'Reach Level 6',
      icon: Trophy,
      unlocked: false,
      xp: 1000,
      rarity: 'legendary',
      color: 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400'
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const currentLevelData = levels.find(l => l.level === currentLevel);
  const CurrentLevelIcon = currentLevelData?.icon || Star;

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'border-gray-300 dark:border-gray-700';
      case 'rare': return 'border-purple-300 dark:border-purple-700';
      case 'epic': return 'border-pink-300 dark:border-pink-700';
      case 'legendary': return 'border-yellow-300 dark:border-yellow-700';
      default: return 'border-gray-300 dark:border-gray-700';
    }
  };

  const getRarityBadge = (rarity) => {
    const colors = {
      common: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
      rare: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      epic: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
      legendary: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-orange-700 dark:text-orange-300'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <ParticipantSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    Achievements
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Track your progress and unlock rewards
                  </p>
                </div>
              </div>
            </div>

            {/* Current Level Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ${currentLevelData?.color}`}>
                      <CurrentLevelIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Level {currentLevel} - {currentLevelData?.name}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {currentXP} / {xpToNextLevel} XP to next level
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-3xl font-bold text-primary">{currentXP}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={(currentXP / xpToNextLevel) * 100} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {xpToNextLevel - currentXP} XP needed to reach Level 2
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unlocked
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {achievements.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    achievements unlocked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Level
                  </CardTitle>
                  <Star className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentLevel}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentLevelData?.name}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Experiments
                  </CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{participatedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Level Progress Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Level Progression
                </CardTitle>
                <CardDescription>
                  Your journey from Novice to Master
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {levels.map((level) => {
                    const LevelIcon = level.icon;
                    const isCurrentLevel = level.level === currentLevel;
                    const isUnlocked = currentLevel >= level.level;
                    const isPast = currentLevel > level.level;
                    
                    return (
                      <div 
                        key={level.level}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrentLevel 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : isUnlocked 
                            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            isCurrentLevel 
                              ? 'bg-primary/20' 
                              : isUnlocked 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-gray-100 dark:bg-gray-900/30'
                          }`}>
                            {isUnlocked ? (
                              <LevelIcon className={`h-6 w-6 ${level.color}`} />
                            ) : (
                              <Lock className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold">Level {level.level}</p>
                              {isCurrentLevel && (
                                <Badge className="text-xs">Current</Badge>
                              )}
                              {isPast && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm font-semibold">{level.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {level.maxXP === Infinity ? `${level.minXP}+ XP` : `${level.minXP} - ${level.maxXP} XP`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Unlocked Achievements ({unlockedAchievements.length})
                </CardTitle>
                <CardDescription>
                  Achievements you've earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unlockedAchievements.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {unlockedAchievements.map((achievement) => {
                      const AchievementIcon = achievement.icon;
                      return (
                        <div 
                          key={achievement.id}
                          className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} ${achievement.color} transition-all hover:shadow-lg hover:scale-105`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center`}>
                              <AchievementIcon className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className={`${getRarityBadge(achievement.rarity)} text-xs`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <h3 className="font-bold mb-1">{achievement.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Star className="h-3 w-3" />
                            <span>+{achievement.xp} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No achievements unlocked yet</p>
                    <p className="text-sm mt-1">Complete experiments to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-500" />
                  Locked Achievements ({lockedAchievements.length})
                </CardTitle>
                <CardDescription>
                  Achievements waiting to be unlocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lockedAchievements.map((achievement) => {
                    const AchievementIcon = achievement.icon;
                    return (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)} bg-muted/30 opacity-60 hover:opacity-80 transition-opacity`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-gray-400" />
                          </div>
                          <Badge variant="outline" className={`${getRarityBadge(achievement.rarity)} text-xs opacity-50`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <h3 className="font-bold mb-1 text-muted-foreground">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <Star className="h-3 w-3" />
                          <span>+{achievement.xp} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 dark:border-blue-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  How to Earn More
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Complete More Experiments</p>
                    <p className="text-xs text-muted-foreground">
                      Each experiment you complete earns you XP and may unlock new achievements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Build a Streak</p>
                    <p className="text-xs text-muted-foreground">
                      Participate regularly to unlock time-based achievements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Level Up</p>
                    <p className="text-xs text-muted-foreground">
                      Reach higher levels to unlock exclusive achievements and rewards
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Achievements;
