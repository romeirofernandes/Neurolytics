import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar';
import { Button } from '../ui/button';
import { HiHome, HiCog, HiLogout, HiShieldCheck, HiSun, HiMoon, HiChartBar } from 'react-icons/hi';

const AdminSidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/admin/auth');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: HiHome,
    },
    {
      title: 'Settings',
      url: '#',
      icon: HiCog,
    },
  ];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HiShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              Control Center
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 mb-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors duration-200
                          ${isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200
                          ${isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground group-hover/menu-item:bg-primary group-hover/menu-item:text-primary-foreground'
                          }
                        `}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className="p-3 space-y-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors duration-200 text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {theme === 'dark' ? (
                <HiMoon className="h-4 w-4" />
              ) : (
                <HiSun className="h-4 w-4" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Theme
            </span>
          </button>

          {/* Separator */}
          <SidebarSeparator />

          {/* Admin Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium">
              <HiShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Administrator
              </p>
              <p className="text-xs text-muted-foreground truncate">
                admin@system.com
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive/20 transition-colors duration-200"
          >
            <HiLogout className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
