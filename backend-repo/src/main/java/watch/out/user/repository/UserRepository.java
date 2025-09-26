package watch.out.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, UserRepositoryCustom {

    boolean existsByUserId(String userId);

    Optional<User> findByUserId(String userId);

    Optional<User> findByUuidAndDeletedAtIsNull(UUID userUuid);

    List<User> findByRoleInAndDeletedAtIsNull(List<UserRole> roles);

    List<User> findByAreaUuidAndDeletedAtIsNull(UUID areaUuid);

    List<User> findByDeletedAtIsNull();

    long countByAreaUuid(UUID areaUuid);
}
