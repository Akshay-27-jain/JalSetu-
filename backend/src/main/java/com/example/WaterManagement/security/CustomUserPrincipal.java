package com.example.WaterManagement.security;

import com.example.WaterManagement.entity.Role;
import com.example.WaterManagement.entity.User;
import com.example.WaterManagement.entity.UserStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String fullName;
    private final Role role;
    private final UserStatus status;
    private final Long apartmentId;
    private final Long householdId;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(Long id, String email, String password, String fullName, Role role, Long apartmentId, Long householdId) {
        this(id, email, password, fullName, role, UserStatus.ACTIVE, apartmentId, householdId);
    }

    public CustomUserPrincipal(Long id, String email, String password, String fullName, Role role, UserStatus status, Long apartmentId, Long householdId) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.apartmentId = apartmentId;
        this.householdId = householdId;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public static CustomUserPrincipal create(User user) {
        Long apartmentId = user.getApartment() != null ? user.getApartment().getId() : null;
        Long householdId = user.getHousehold() != null ? user.getHousehold().getId() : null;

        return new CustomUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                apartmentId,
                householdId
        );
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }
    public UserStatus getStatus() { return status; }
    public Long getApartmentId() { return apartmentId; }
    public Long getHouseholdId() { return householdId; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.BLOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != UserStatus.INACTIVE;
    }
}
