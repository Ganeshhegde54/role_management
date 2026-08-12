package com.rolemanagement.repository;

import com.rolemanagement.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);

    Set<Role> findByNameIn(Set<String> names);

    @Query("SELECT r FROM Role r WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Role> searchRoles(@Param("query") String query, Pageable pageable);
}
