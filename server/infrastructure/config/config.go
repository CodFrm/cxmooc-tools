package config

import (
	"fmt"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

type Config struct {
	MySQL       MySQL
	Redis       Redis
	VCodeServer string `yaml:"vcode-server"`
	ClientToken string `yaml:"client-token"`
	Listen      string `yaml:"listen"`
}

type Redis struct {
	Addr     string
	Password string
	DB       int
}

type MySQL struct {
	Dsn string
}

var AppConfig Config

func Init(filename string) error {
	file, err := ioutil.ReadFile(filename)
	if err != nil {
		return fmt.Errorf("config read error: %v", err)

	}
	err = yaml.Unmarshal(file, &AppConfig)
	if err != nil {
		return fmt.Errorf("unmarshal error: %v", err)
	}
	return nil
}
