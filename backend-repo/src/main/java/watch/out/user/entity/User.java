package watch.out.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import watch.out.area.entity.Area;
import watch.out.common.entity.BaseSoftDeleteEntity;
import watch.out.company.entity.Company;

@Entity
@Table(name = "users")
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE uuid = ?")
public class User extends BaseSoftDeleteEntity {

    @Column(name = "user_id", nullable = false, unique = true, length = 7)
    private String userId;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "user_name", nullable = false, length = 20)
    private String userName;

    @Column(nullable = false, length = 11)
    private String contact;

    @Column(name = "emergency_contact", nullable = false, length = 11)
    private String emergencyContact;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type", nullable = false)
    private BloodType bloodType;

    @Enumerated(EnumType.STRING)
    @Column(name = "rh_factor", nullable = false)
    private RhFactor rhFactor;

    @Enumerated(EnumType.STRING)
    @Column(name = "training_status", nullable = false)
    private TrainingStatus trainingStatus;

    @Column(name = "training_completed_at")
    private LocalDateTime trainingCompletedAt;

    @Column(name = "photo_key", nullable = false, length = 100)
    private String photoKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false)
    private UserRole role;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "assignment_date")
    private Integer assignmentDate;

    @Column(name = "avg_embedding")
    private byte[] avgEmbedding;

    @Column(name = "is_approved")
    private boolean isApproved;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_uuid", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_uuid")
    private Area area;

    @PrePersist
    void applyDefaults() {
        if (this.trainingStatus == null) {
            this.trainingStatus = TrainingStatus.NOT_COMPLETED;
        }
        if (this.role == null) {
            this.role = UserRole.WORKER;
        }
    }

    public void updateUser(String userName, String contact, String emergencyContact,
        BloodType bloodType,
        RhFactor rhFactor, String photoKey, Company company) {
        if (userName != null) {
            this.userName = userName;
        }
        if (contact != null) {
            this.contact = contact;
        }
        if (emergencyContact != null) {
            this.emergencyContact = emergencyContact;
        }
        if (bloodType != null) {
            this.bloodType = bloodType;
        }
        if (rhFactor != null) {
            this.rhFactor = rhFactor;
        }
        if (photoKey != null) {
            this.photoKey = photoKey;
        }
        if (company != null) {
            this.company = company;
        }
    }
}
