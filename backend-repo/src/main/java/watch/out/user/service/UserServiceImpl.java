package watch.out.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.company.entity.Company;
import watch.out.company.repository.CompanyRepository;
import watch.out.user.dto.request.SignupRequest;
import watch.out.user.entity.User;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void createUser(SignupRequest signupRequest) {
        if (userRepository.existsByUserId(signupRequest.userId())) {
            throw new BusinessException(ErrorCode.ALREADY_EXISTS);
        }

        Company company = companyRepository.findById(signupRequest.companyUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        String encodedPassword = passwordEncoder.encode(signupRequest.password());
        String photoKey = signupRequest.photoUrl(); // S3 생성 후 수정 필요

        User user = signupRequest.toEntity(encodedPassword, company, photoKey);
        userRepository.save(user);
    }
}
