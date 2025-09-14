package watch.out.user.service;

import watch.out.user.dto.request.SignupRequest;

public interface UserService {

    void createUser(SignupRequest signupRequest);
}
