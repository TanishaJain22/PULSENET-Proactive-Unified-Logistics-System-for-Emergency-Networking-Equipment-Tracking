package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.entity.enums.UserRole;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private UUID userId;
    private String email;
    private UserRole role;
    private UUID hospitalId;
    private String hospitalName;
    private String token;
}