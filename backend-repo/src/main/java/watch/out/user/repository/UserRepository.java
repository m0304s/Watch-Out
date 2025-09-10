package watch.out.user.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.user.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByUserId(String userId);

    Optional<User> findByUserId(String userId);
}
