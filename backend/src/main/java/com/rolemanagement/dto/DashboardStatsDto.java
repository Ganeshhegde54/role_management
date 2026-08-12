package com.rolemanagement.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalUsers;
    private long totalRoles;
    private long totalPermissions;
    private long activeUsers;
    private Map<String, Long> roleDistribution;
    private List<UserDto> recentUsers;
    private List<RoleDto> recentRoles;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalUsers, long totalRoles, long totalPermissions, long activeUsers,
                            Map<String, Long> roleDistribution, List<UserDto> recentUsers, List<RoleDto> recentRoles) {
        this.totalUsers = totalUsers;
        this.totalRoles = totalRoles;
        this.totalPermissions = totalPermissions;
        this.activeUsers = activeUsers;
        this.roleDistribution = roleDistribution;
        this.recentUsers = recentUsers;
        this.recentRoles = recentRoles;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalRoles() {
        return totalRoles;
    }

    public void setTotalRoles(long totalRoles) {
        this.totalRoles = totalRoles;
    }

    public long getTotalPermissions() {
        return totalPermissions;
    }

    public void setTotalPermissions(long totalPermissions) {
        this.totalPermissions = totalPermissions;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public Map<String, Long> getRoleDistribution() {
        return roleDistribution;
    }

    public void setRoleDistribution(Map<String, Long> roleDistribution) {
        this.roleDistribution = roleDistribution;
    }

    public List<UserDto> getRecentUsers() {
        return recentUsers;
    }

    public void setRecentUsers(List<UserDto> recentUsers) {
        this.recentUsers = recentUsers;
    }

    public List<RoleDto> getRecentRoles() {
        return recentRoles;
    }

    public void setRecentRoles(List<RoleDto> recentRoles) {
        this.recentRoles = recentRoles;
    }
}
