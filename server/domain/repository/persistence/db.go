package persistence

import (
	"log"

	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	goRedis "github.com/go-redis/redis/v7"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

var mysql *gorm.DB

var redis *goRedis.Client

func Init() {
	db, err := gorm.Open("mysql", config.AppConfig.MySQL.Dsn)
	if err != nil {
		log.Fatalf("sql open error: %v", err)
	}
	mysql = db

	redis = goRedis.NewClient(&goRedis.Options{
		Addr:     config.AppConfig.Redis.Addr,
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.DB,
	})
	if _, err := redis.Ping().Result(); err != nil {
		log.Fatalf("redis open error: %v", err)
	}

}
