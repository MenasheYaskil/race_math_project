package com.innovativelearning.services;

import com.innovativelearning.entities.QuestionTemplateEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class QuestionTemplateCatalog {

    public static class WordProblem {
        public String questionText;
        public int correctAnswer;
        public List<Integer> distractors = new ArrayList<>();
        public String fingerprint;
    }

    private static final Random random = new Random();

    private static <T> T pick(T[] array) {
        return array[random.nextInt(array.length)];
    }

    public static WordProblem generate(QuestionTemplateEntity template) {
        String logicTag = template.getLogicTag() != null ? template.getLogicTag() : "EQ_REVERSE_OPS";
        WordProblem wp = new WordProblem();
        
        int attempts = 0;
        while (attempts < 10) {
            attempts++;
            try {
                switch (logicTag) {
                    case "PERCENT_REVERSE_DISCOUNT": {
                        int[] prices = {80, 100, 120, 150, 200, 250};
                        int[] discounts = {10, 20, 25, 40, 50};
                        int originalPrice = pick(new Integer[]{80, 100, 120, 150, 200, 250});
                        int discount = pick(new Integer[]{10, 20, 25, 40, 50});
                        int finalPrice = originalPrice * (100 - discount) / 100;
                        
                        wp.questionText = "מחיר חולצה לאחר הנחה של " + discount + "% הוא " + finalPrice + " ש״ח. מה היה המחיר המקורי?";
                        wp.correctAnswer = originalPrice;
                        wp.distractors.add(finalPrice + (finalPrice * discount / 100));
                        wp.distractors.add(originalPrice - finalPrice);
                        wp.distractors.add(discount > 0 ? finalPrice / (discount / 100) : finalPrice + 10);
                        wp.fingerprint = "PRD_" + originalPrice + "_" + discount;
                        return wp;
                    }
                    case "PERCENT_REVERSE_INCREASE": {
                        int originalPrice = pick(new Integer[]{50, 100, 200, 300, 500});
                        int increase = pick(new Integer[]{10, 25, 50, 100});
                        int finalPrice = originalPrice * (100 + increase) / 100;
                        
                        wp.questionText = "לאחר התייקרות של " + increase + "%, מחירו של מוצר הוא " + finalPrice + " ש״ח. מה היה מחירו המקורי?";
                        wp.correctAnswer = originalPrice;
                        wp.distractors.add(finalPrice - (finalPrice * increase / 100));
                        wp.distractors.add(finalPrice - originalPrice);
                        wp.distractors.add(originalPrice * increase / 100);
                        wp.fingerprint = "PRI_" + originalPrice + "_" + increase;
                        return wp;
                    }
                    case "RATIO_SHARE_AMOUNT": {
                        int ratioA = pick(new Integer[]{1, 2, 3});
                        int ratioB = pick(new Integer[]{2, 3, 4});
                        if (ratioA == ratioB) ratioB++;
                        int m = pick(new Integer[]{10, 20, 50, 100});
                        int danny = ratioA * m;
                        int total = (ratioA + ratioB) * m;
                        
                        wp.questionText = "סכום של " + total + " ש״ח חולק בין דני לדינה ביחס של " + ratioA + ":" + ratioB + ". כמה כסף קיבל דני?";
                        wp.correctAnswer = danny;
                        wp.distractors.add(ratioB * m);
                        wp.distractors.add(total / 2);
                        wp.distractors.add(total / ratioA);
                        wp.fingerprint = "RSA_" + ratioA + "_" + ratioB + "_" + m;
                        return wp;
                    }
                    case "RATIO_FIND_TOTAL": {
                        int ratioA = pick(new Integer[]{2, 3, 5});
                        int ratioB = pick(new Integer[]{1, 3, 4});
                        int m = pick(new Integer[]{4, 5, 6, 8});
                        int numA = ratioA * m;
                        int total = (ratioA + ratioB) * m;
                        
                        wp.questionText = "בכיתה יש בנים ובנות ביחס " + ratioA + ":" + ratioB + ". אם יש " + numA + " בנים, כמה ילדים יש סך הכל בכיתה?";
                        wp.correctAnswer = total;
                        wp.distractors.add(ratioB * m);
                        wp.distractors.add(numA * ratioB);
                        wp.distractors.add(numA + ratioB);
                        wp.fingerprint = "RFT_" + ratioA + "_" + ratioB + "_" + m;
                        return wp;
                    }
                    case "SPEED_MEETING_POINT": {
                        int speedA = pick(new Integer[]{60, 80, 90});
                        int speedB = pick(new Integer[]{40, 70, 110});
                        int time = pick(new Integer[]{2, 3, 4, 5});
                        int distance = (speedA + speedB) * time;
                        
                        wp.questionText = "שתי רכבות יוצאות זו לקראת זו ממרחק " + distance + " ק״מ. מהירות רכבת א׳ היא " + speedA + " קמ״ש ורכבת ב׳ " + speedB + " קמ״ש. לאחר כמה שעות ייפגשו?";
                        wp.correctAnswer = time;
                        if (speedA != speedB && distance % Math.abs(speedA - speedB) == 0) {
                            wp.distractors.add(distance / Math.abs(speedA - speedB));
                        } else {
                            wp.distractors.add(time * 2);
                        }
                        wp.distractors.add(distance / speedA);
                        wp.distractors.add(time + 1);
                        wp.fingerprint = "SMP_" + speedA + "_" + speedB + "_" + time;
                        return wp;
                    }
                    case "SPEED_CATCH_UP": {
                        int speedA = pick(new Integer[]{60, 80});
                        int delay = pick(new Integer[]{1, 2});
                        int speedB = pick(new Integer[]{90, 100, 120});
                        if (speedB <= speedA) speedB = speedA + 20;
                        int gap = speedA * delay;
                        int closeSpeed = speedB - speedA;
                        if (gap % closeSpeed != 0) continue; // retry
                        int time = gap / closeSpeed;
                        
                        wp.questionText = "רכב יוצא מעיר במהירות " + speedA + " קמ״ש. כעבור " + delay + " שעות יוצא בעקבותיו רכב שני במהירות " + speedB + " קמ״ש. כמה שעות ייקח לרכב השני להשיג את הראשון?";
                        wp.correctAnswer = time;
                        wp.distractors.add(time + delay);
                        if (gap % (speedB + speedA) == 0) {
                            wp.distractors.add(gap / (speedB + speedA));
                        } else {
                            wp.distractors.add(time + 2);
                        }
                        wp.distractors.add(gap * 2);
                        wp.fingerprint = "SCU_" + speedA + "_" + speedB + "_" + delay;
                        return wp;
                    }
                    case "WORK_TOGETHER": {
                        int[][] pairs = {{3, 6}, {4, 12}, {10, 15}, {20, 30}};
                        int[] pair = pick(pairs);
                        int timeA = pair[0];
                        int timeB = pair[1];
                        int answer = (timeA * timeB) / (timeA + timeB);
                        
                        wp.questionText = "פועל א׳ מסיים עבודה ב-" + timeA + " שעות. פועל ב׳ מסיים אותה ב-" + timeB + " שעות. בכמה שעות יסיימו את העבודה יחד?";
                        wp.correctAnswer = answer;
                        wp.distractors.add((timeA + timeB) / 2);
                        wp.distractors.add(timeA + timeB);
                        wp.distractors.add(Math.abs(timeA - timeB));
                        wp.fingerprint = "WT_" + timeA + "_" + timeB;
                        return wp;
                    }
                    case "AVERAGE_ADD_ITEM": {
                        int count = pick(new Integer[]{3, 4, 9});
                        int avg = pick(new Integer[]{10, 20, 50});
                        int newAvg = avg + pick(new Integer[]{2, 3, 5});
                        int newNum = (newAvg * (count + 1)) - (count * avg);
                        
                        wp.questionText = "הממוצע של " + count + " מספרים הוא " + avg + ". אם נוסיף את המספר " + newNum + ", מה יהיה הממוצע החדש?";
                        wp.correctAnswer = newAvg;
                        wp.distractors.add((avg + newNum) / 2);
                        if (newNum % count == 0) {
                            wp.distractors.add(avg + (newNum / count));
                        } else {
                            wp.distractors.add(avg + 1);
                        }
                        wp.distractors.add(avg + newNum);
                        wp.fingerprint = "AAI_" + count + "_" + avg + "_" + newNum;
                        return wp;
                    }
                    case "AVERAGE_TARGET": {
                        int count = pick(new Integer[]{2, 3, 4});
                        int avg = pick(new Integer[]{70, 75, 80});
                        int targetAvg = avg + pick(new Integer[]{2, 4, 5});
                        int nextScore = (targetAvg * (count + 1)) - (avg * count);
                        
                        wp.questionText = "הממוצע של דני ב-" + count + " מבחנים הוא " + avg + ". כדי שהממוצע שלו יעלה ל-" + targetAvg + ", כמה הוא צריך לקבל במבחן הבא?";
                        wp.correctAnswer = nextScore;
                        wp.distractors.add(avg + (targetAvg - avg));
                        wp.distractors.add(targetAvg + (targetAvg - avg));
                        wp.distractors.add(targetAvg + count);
                        wp.fingerprint = "AT_" + count + "_" + avg + "_" + targetAvg;
                        return wp;
                    }
                    case "SETS_TWO_OVERLAP": {
                        int setA = 10 + random.nextInt(11); // 10..20
                        int setB = 10 + random.nextInt(11); // 10..20
                        int both = 5 + random.nextInt(6); // 5..10
                        if (both > Math.min(setA, setB)) both = Math.min(setA, setB);
                        int none = 2 + random.nextInt(4); // 2..5
                        int total = setA + setB - both + none;
                        
                        wp.questionText = "בכיתה יש " + total + " תלמידים. " + setA + " לומדים פיזיקה, " + setB + " לומדים כימיה, ו-" + both + " לומדים את שניהם. כמה תלמידים לא לומדים אף אחד מהמקצועות?";
                        wp.correctAnswer = none;
                        wp.distractors.add(total - (setA + setB));
                        wp.distractors.add(total - both);
                        wp.distractors.add(total - (setA + setB + both));
                        wp.fingerprint = "STO_" + setA + "_" + setB + "_" + both + "_" + none;
                        return wp;
                    }
                    case "QUANT_PRICE_EQ": {
                        int notebookPrice = pick(new Integer[]{5, 10, 15});
                        int bookPrice = notebookPrice * 2;
                        int numBooks = pick(new Integer[]{2, 3, 4});
                        int numNotebooks = pick(new Integer[]{2, 3, 4});
                        int total = (numBooks * bookPrice) + (numNotebooks * notebookPrice);
                        
                        wp.questionText = "מחירו של ספר כפול ממחירה של מחברת. דני קנה " + numBooks + " ספרים ו-" + numNotebooks + " מחברות ושילם " + total + " ש״ח. מה מחירו של ספר?";
                        wp.correctAnswer = bookPrice;
                        wp.distractors.add(notebookPrice);
                        if (total % (numBooks + numNotebooks) == 0) {
                            wp.distractors.add(total / (numBooks + numNotebooks));
                        } else {
                            wp.distractors.add(bookPrice + 5);
                        }
                        wp.distractors.add(bookPrice * 2);
                        wp.fingerprint = "QPE_" + notebookPrice + "_" + numBooks + "_" + numNotebooks;
                        return wp;
                    }
                    case "EQ_REVERSE_OPS":
                    default: {
                        int x = 3 + random.nextInt(8); // 3..10
                        int mult = 2 + random.nextInt(4); // 2..5
                        int sub = 2 + random.nextInt(9); // 2..10
                        int result = (x * mult) - sub;
                        
                        wp.questionText = "אם נכפול מספר ב-" + mult + " ונחסר מהתוצאה " + sub + ", נקבל " + result + ". מהו המספר?";
                        wp.correctAnswer = x;
                        wp.distractors.add((result * mult) + sub);
                        if (result % mult == 0) {
                            wp.distractors.add((result / mult) - sub);
                        } else {
                            wp.distractors.add(x + 2);
                        }
                        if ((result - sub) % mult == 0) {
                            wp.distractors.add((result - sub) / mult);
                        } else {
                            wp.distractors.add(x + sub);
                        }
                        wp.fingerprint = "ERO_" + x + "_" + mult + "_" + sub;
                        return wp;
                    }
                }
            } catch (Exception e) {
                // Ignore and retry
            }
        }
        
        // Fallback
        WordProblem fallback = new WordProblem();
        fallback.questionText = "אם נכפול מספר ב-2 ונחסר מהתוצאה 5, נקבל 5. מהו המספר?";
        fallback.correctAnswer = 5;
        fallback.distractors.add(15);
        fallback.distractors.add(10);
        fallback.distractors.add(0);
        fallback.fingerprint = "FALLBACK_5";
        return fallback;
    }
}
