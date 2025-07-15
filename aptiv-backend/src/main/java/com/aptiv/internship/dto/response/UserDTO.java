package com.aptiv.internship.dto.response;

import com.aptiv.internship.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private boolean active;

    public UserDTO(Long id, String email, String firstName, String lastName, User.Role role, Object active) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role.toString();
        this.active = (Boolean) active;
        
    }
}
