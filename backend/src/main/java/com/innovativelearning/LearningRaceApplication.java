package com.innovativelearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.ApplicationContext;
import com.innovativelearning.persist.Persist;
import com.innovativelearning.entities.UserEntity;
import com.innovativelearning.entities.QuestionTemplateEntity;
import com.innovativelearning.enums.UserRole;

import java.util.List;
import java.util.UUID;

@SpringBootApplication(exclude = {HibernateJpaAutoConfiguration.class, JpaRepositoriesAutoConfiguration.class})
public class LearningRaceApplication {

    private final ApplicationContext applicationContext;

    public LearningRaceApplication(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    public static void main(String[] args) {
        SpringApplication.run(LearningRaceApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedData() {
        Persist persist = applicationContext.getBean(Persist.class);
        
        if (persist.executeQuery("from UserEntity where loginName = :ln", java.util.Map.of("ln", "teacher"), UserEntity.class).isEmpty()) {
            UserEntity teacher = new UserEntity();
            teacher.setLoginName("teacher");
            teacher.setPasswordHash("password123");
            teacher.setDisplayName("Teacher");
            teacher.setRole(UserRole.TEACHER.name());
            teacher.setToken(UUID.randomUUID().toString());
            teacher.setActive(true);
            teacher.setCreatedAt(System.currentTimeMillis());
            persist.save(teacher);
            System.out.println("Seeded teacher user (teacher/password123)");
        }

        // Deactivate old placeholder templates
        List<QuestionTemplateEntity> allTemplates = persist.list(QuestionTemplateEntity.class);
        for (QuestionTemplateEntity tmpl : allTemplates) {
            if (tmpl.getLogicTag() == null || tmpl.getLogicTag().trim().isEmpty() ||
                tmpl.getBranchCompatibility() == null || tmpl.getBranchCompatibility().trim().isEmpty()) {
                if (Boolean.TRUE.equals(tmpl.getIsActive())) {
                    tmpl.setIsActive(false);
                    persist.update(tmpl);
                }
            }
        }

        seedA1Template(persist, "PERCENT_REVERSE_DISCOUNT", "PERCENT_REVERSE", "NORMAL", 5, 60);
        seedA1Template(persist, "PERCENT_REVERSE_DISCOUNT", "PERCENT_REVERSE", "DIRT_ROAD", 3, 60);
        
        seedA1Template(persist, "PERCENT_REVERSE_INCREASE", "PERCENT_REVERSE", "HIGHWAY", 7, 60);

        seedA1Template(persist, "RATIO_SHARE_AMOUNT", "RATIO_SPLIT", "NORMAL", 4, 60);
        seedA1Template(persist, "RATIO_SHARE_AMOUNT", "RATIO_SPLIT", "DIRT_ROAD", 2, 60);

        seedA1Template(persist, "RATIO_FIND_TOTAL", "RATIO_SPLIT", "HIGHWAY", 6, 60);

        seedA1Template(persist, "SPEED_MEETING_POINT", "SPEED_DISTANCE", "NORMAL", 5, 60);
        seedA1Template(persist, "SPEED_MEETING_POINT", "SPEED_DISTANCE", "HIGHWAY", 7, 60);

        seedA1Template(persist, "SPEED_CATCH_UP", "SPEED_DISTANCE", "HIGHWAY", 8, 60);

        seedA1Template(persist, "WORK_TOGETHER", "JOINT_WORK", "HIGHWAY", 7, 60);

        seedA1Template(persist, "AVERAGE_ADD_ITEM", "AVERAGES", "NORMAL", 5, 60);
        seedA1Template(persist, "AVERAGE_ADD_ITEM", "AVERAGES", "DIRT_ROAD", 3, 60);

        seedA1Template(persist, "AVERAGE_TARGET", "AVERAGES", "NORMAL", 5, 60);

        seedA1Template(persist, "SETS_TWO_OVERLAP", "OVERLAPPING_SETS", "NORMAL", 5, 60);
        seedA1Template(persist, "SETS_TWO_OVERLAP", "OVERLAPPING_SETS", "DIRT_ROAD", 4, 60);

        seedA1Template(persist, "QUANT_PRICE_EQ", "QUANT_COMPARISON", "NORMAL", 5, 60);

        seedA1Template(persist, "EQ_REVERSE_OPS", "WORD_TO_EQ", "NORMAL", 3, 60);
        seedA1Template(persist, "EQ_REVERSE_OPS", "WORD_TO_EQ", "DIRT_ROAD", 2, 60);
    }

    private void seedA1Template(Persist persist, String logicTag, String family, String branch, int difficulty, int time) {
        List<QuestionTemplateEntity> existing = persist.executeQuery(
            "from QuestionTemplateEntity where logicTag = :lt and branchCompatibility = :bc",
            java.util.Map.of("lt", logicTag, "bc", branch), QuestionTemplateEntity.class);

        QuestionTemplateEntity q;
        if (!existing.isEmpty()) {
            q = existing.get(0);
        } else {
            q = new QuestionTemplateEntity();
        }

        q.setSubject("Math");
        q.setTemplateType(family);
        q.setOperator("+");
        q.setDifficulty(difficulty);
        q.setMinValue(1);
        q.setMaxValue(10);
        q.setBaseTimeSeconds(time);
        q.setIsActive(true);
        q.setTemplateFamily(family);
        q.setLogicTag(logicTag);
        q.setAntiRepeatGroup(family);
        q.setDifficultyBand(difficulty);
        q.setBranchCompatibility(branch);
        q.setStepsCount(1);
        q.setAllowsDecimal(false);
        q.setMaxDecimalPlaces(0);

        if (q.getId() == null) {
            persist.save(q);
        } else {
            persist.update(q);
        }
    }
}
