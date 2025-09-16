package watch.out.user.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.area.entity.Area;
import watch.out.area.entity.EntryExit;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.dto.request.ApproveUsersRequest;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.UserRole;

import static watch.out.user.entity.QUser.user;
import static watch.out.company.entity.QCompany.company;
import static watch.out.area.entity.QArea.area;
import static watch.out.area.entity.QEntryExitHistory.entryExitHistory;


@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<UserWithAreaDto> findUserWithAreaById(UUID userUuid) {
        UserWithAreaDto result = queryFactory
            .select(Projections.constructor(UserWithAreaDto.class,
                user.uuid.as("userUuid"),
                user.userId.as("userId"),
                user.userName.as("userName"),
                user.contact.as("contact"),
                user.emergencyContact.as("emergencyContact"),
                user.bloodType.stringValue().as("bloodType"),
                user.rhFactor.stringValue().as("rhFactor"),
                company.companyName.as("companyName"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                area.areaAlias.as("areaAlias")
            ))
            .from(user)
            .leftJoin(user.area, area)
            .leftJoin(user.company, company)
            .where(user.uuid.eq(userUuid))
            .fetchOne();

        return Optional.ofNullable(result);
    }

    @Override
    public PageResponse<UsersResponse> findUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, UserRole userRole, PageRequest pageRequest) {
        long offset = (long) pageRequest.pageNum() * pageRequest.display();

        List<UsersResponse> usersResponse = createBaseUserQuery()
            .where(
                user.deletedAt.isNull(),
                user.isApproved.isTrue(),
                areaUuidEq(areaUuid),
                trainingStatusEq(trainingStatus),
                searchContains(search),
                userRoleEq(userRole)
            )
            .offset(offset)
            .limit(pageRequest.display())
            .orderBy(user.createdAt.desc())
            .fetch();

        Long count = fetchUserCount(
            user.deletedAt.isNull(),
            user.isApproved.isTrue(),
            areaUuidEq(areaUuid),
            trainingStatusEq(trainingStatus),
            searchContains(search),
            userRoleEq(userRole)
        );

        return PageResponse.of(usersResponse, pageRequest.pageNum(), pageRequest.display(), count);
    }

    @Override
    public Optional<UserResponse> findByUserIdAsDto(UUID userUuid) {
//        return queryFactory.select(
//                Projections.constructor(UserResponse.class,
//                    user.uuid,
//                    user.userId,
//                    user.userName,
//                    user.company.companyName,
//                    user.area.areaName,
//                    user.contact,
//                    user.emergencyContact,
//                    user.gender,
//                    user.bloodType,
//                    user.rhFactor,
//                    user.trainingStatus,
//                    user.trainingCompletedAt,
//                    user.role,
//                    user.watch.watchNumber,
//                    user.photoKey,
//                    user.assignedAt
//                )
//            )
//            .from(user)
//            .join(user.company, company)
//            .leftJoin(user.area, area)
//            .leftJoin(rentalHistory).on(rentalHistory.user.uuid.eq(user.uuid)
//                .and(rentalHistory.returnedAt.isNull()))
//            .leftJoin(watch).on(watch.uuid.eq(rentalHistory.watch.uuid))
//            .where(user.uuid.eq(userUuid))
//            .fetchOne();
        return Optional.empty();
    }

    @Override
    public void updateAreaForUsers(List<UUID> userUuids, Area area) {
        if (userUuids == null || userUuids.isEmpty()) {
            return;
        }

        queryFactory
            .update(user)
            .set(user.area, area)
            .where(user.uuid.in(userUuids))
            .execute();
    }

    @Override
    public PageResponse<UsersResponse> findUsersWhereIsApprovedIsFalse(PageRequest pageRequest) {
        long offset = (long) pageRequest.pageNum() * pageRequest.display();

        List<UsersResponse> usersResponse = createBaseUserQuery()
            .where(
                user.deletedAt.isNull(),
                user.isApproved.isFalse()
            )
            .offset(offset)
            .limit(pageRequest.display())
            .orderBy(user.createdAt.desc())
            .fetch();

        Long count = fetchUserCount(
            user.deletedAt.isNull(),
            user.isApproved.isFalse()
        );

        return PageResponse.of(usersResponse, pageRequest.pageNum(), pageRequest.display(), count);
    }

    @Override
    public void updateIsApprovedForUsers(ApproveUsersRequest approveUsersRequest) {
        queryFactory
            .update(user)
            .set(user.isApproved, true)
            .where(user.uuid.in(approveUsersRequest.userUuids()))
            .execute();
    }

    private JPAQuery<UsersResponse> createBaseUserQuery() {
        return queryFactory.select(
                Projections.constructor(UsersResponse.class,
                    user.uuid,
                    user.userId,
                    user.userName,
                    user.company.companyName,
                    user.area.areaName,
                    user.trainingStatus,
                    JPAExpressions
                        .select(entryExitHistory.createdAt.max())
                        .from(entryExitHistory)
                        .where(entryExitHistory.user.uuid.eq(user.uuid)
                            .and(entryExitHistory.type.eq(EntryExit.ENTRY))),
                    user.role,
                    user.photoKey
                )
            )
            .from(user)
            .join(user.company, company)
            .leftJoin(user.area, area);
    }

    private Long fetchUserCount(BooleanExpression... conditions) {
        Long count = queryFactory
            .select(user.count())
            .from(user)
            .leftJoin(user.area, area)
            .where(conditions)
            .fetchOne();
        return count != null ? count : 0L;
    }

    private BooleanExpression areaUuidEq(UUID areaUuid) {
        return areaUuid != null ? user.area.uuid.eq(areaUuid) : null;
    }

    private BooleanExpression trainingStatusEq(TrainingStatus trainingStatus) {
        return trainingStatus != null ? user.trainingStatus.eq(trainingStatus) : null;
    }

    private BooleanExpression searchContains(String search) {
        return StringUtils.hasText(search) ? user.userName.contains(search)
            .or(user.userId.contains(search)) : null;
    }

    private BooleanExpression userRoleEq(UserRole userRole) {
        return userRole != null ? user.role.eq(userRole) : null;
    }
}
