package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.CTNL;
import com.example.demo.entity.CTNLId;

public interface CTNLRepository extends JpaRepository<CTNL, CTNLId> {

    @Modifying
    @Query(value = "DELETE FROM ctnl WHERE nl_id = :ingredientId", nativeQuery = true)
    int deleteByIngredientId(@Param("ingredientId") Integer ingredientId);
}
